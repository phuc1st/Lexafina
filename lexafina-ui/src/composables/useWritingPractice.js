import { computed, ref } from 'vue'
import { api } from '../services/api'
import { mapWritingQuiz } from '../services/writingMapper'
import { useTimer } from './useTimer'

/** Khởi tạo object nháp 4 section (IELTS Writing Task 1 layout). */
function emptyDraftSections() {
  return {
    introduction: '',
    overview: '',
    body1: '',
    body2: '',
  }
}

/**
 * Quản lý state Writing practice: load quiz, editor content, draft local, timer.
 */
export function useWritingPractice() {
  const loading = ref(false)
  const error = ref(null)
  const writing = ref(null)
  /** Nội dung nháp theo 4 khối: Introduction, Overview, Body 1, Body 2 */
  const draftSections = ref(emptyDraftSections())

  const {
    formatted: timerFormatted,
    remaining: timerRemaining,
    start: startTimer,
    stop: stopTimer,
    reset: resetTimer,
  } = useTimer(60 * 60)

  const wordCount = computed(() => {
    const s = draftSections.value
    const combined = [s.introduction, s.overview, s.body1, s.body2].join('\n')
    const words = combined
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
    localStorage.setItem(
      draftStorageKey.value,
      JSON.stringify(draftSections.value)
    )
  }

  /**
   * Khôi phục nháp: hỗ trợ JSON 4 section; chuỗi thuần (phiên bản cũ) gán vào Introduction.
   */
  function restoreDraft() {
    if (!draftStorageKey.value) return
    const raw = localStorage.getItem(draftStorageKey.value)
    if (!raw) {
      draftSections.value = emptyDraftSections()
      return
    }
    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && 'introduction' in parsed) {
        draftSections.value = { ...emptyDraftSections(), ...parsed }
        return
      }
    } catch {
      /* legacy plain text */
    }
    draftSections.value = { ...emptyDraftSections(), introduction: raw }
  }

  function clearDraft() {
    if (!draftStorageKey.value) return
    localStorage.removeItem(draftStorageKey.value)
    draftSections.value = emptyDraftSections()
  }

  return {
    loading,
    error,
    writing,
    draftSections,
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
