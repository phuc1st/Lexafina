import { computed, ref } from 'vue'
import { api } from '../services/api'
import { mapWritingQuiz } from '../services/writingMapper'
import { useTimer } from './useTimer'

/**
 * Quản lý state Writing practice: load quiz, editor content, draft local, timer.
 */
export function useWritingPractice() {
  const loading = ref(false)
  const error = ref(null)
  const writing = ref(null)
  const draftText = ref('')

  const {
    formatted: timerFormatted,
    remaining: timerRemaining,
    start: startTimer,
    stop: stopTimer,
    reset: resetTimer,
  } = useTimer(60 * 60)

  const wordCount = computed(() => {
    const words = draftText.value
      .trim()
      .split(/\s+/)
      .filter(Boolean)
    return words.length
  })

  const draftStorageKey = computed(() =>
    writing.value?.id ? `lexafina:writing:draft:${writing.value.id}` : ''
  )

  /**
   * Load đề writing detail.
   * @param {number} quizId id bài writing
   */
  async function load(quizId) {
    loading.value = true
    error.value = null
    try {
      const raw = await api.getQuiz(quizId)
      writing.value = mapWritingQuiz(raw)
      restoreDraft()
      resetTimer((writing.value.timeMinutes || 60) * 60)
      startTimer()
    } catch (e) {
      error.value = e
      writing.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Lưu nháp bài viết vào localStorage để tránh mất dữ liệu khi reload.
   */
  function saveDraft() {
    if (!draftStorageKey.value) return
    localStorage.setItem(draftStorageKey.value, draftText.value || '')
  }

  function restoreDraft() {
    if (!draftStorageKey.value) return
    draftText.value = localStorage.getItem(draftStorageKey.value) || ''
  }

  function clearDraft() {
    if (!draftStorageKey.value) return
    localStorage.removeItem(draftStorageKey.value)
    draftText.value = ''
  }

  return {
    loading,
    error,
    writing,
    draftText,
    wordCount,
    timerFormatted,
    timerRemaining,
    stopTimer,
    load,
    saveDraft,
    restoreDraft,
    clearDraft,
  }
}
