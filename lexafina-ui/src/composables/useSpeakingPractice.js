import { computed, ref } from 'vue'
import { api } from '../services/api'
import { mapSpeakingQuiz } from '../services/speakingMapper'

/**
 * Composable cho speaking practice: part/question navigation + recorder cơ bản.
 */
export function useSpeakingPractice() {
  const loading = ref(false)
  const error = ref(null)
  const speaking = ref(null)

  const currentPartIdx = ref(0)
  const currentQuestionIdx = ref(0)
  const isRecording = ref(false)
  const recordError = ref('')

  const mediaRecorder = ref(null)
  const mediaStream = ref(null)
  const questionBlobs = ref({})

  const currentPart = computed(() => speaking.value?.parts?.[currentPartIdx.value] || null)
  const currentQuestions = computed(() => currentPart.value?.questions || [])
  const currentQuestion = computed(() => currentQuestions.value[currentQuestionIdx.value] || null)

  async function load(quizId) {
    loading.value = true
    error.value = null
    try {
      const raw = await api.getQuiz(quizId)
      speaking.value = mapSpeakingQuiz(raw)
      currentPartIdx.value = 0
      currentQuestionIdx.value = 0
    } catch (e) {
      error.value = e
      speaking.value = null
    } finally {
      loading.value = false
    }
  }

  function setPartIndex(index) {
    const max = (speaking.value?.parts?.length || 1) - 1
    currentPartIdx.value = Math.max(0, Math.min(index, max))
    currentQuestionIdx.value = 0
  }

  function setQuestionIndex(index) {
    const max = Math.max(0, currentQuestions.value.length - 1)
    currentQuestionIdx.value = Math.max(0, Math.min(index, max))
  }

  /**
   * Bắt đầu ghi âm câu hiện tại bằng MediaRecorder.
   */
  async function startRecording() {
    recordError.value = ''
    if (isRecording.value || !currentQuestion.value) return
    try {
      mediaStream.value = await navigator.mediaDevices.getUserMedia({ audio: true })
      const chunks = []
      mediaRecorder.value = new MediaRecorder(mediaStream.value)
      mediaRecorder.value.ondataavailable = (e) => {
        if (e.data?.size) chunks.push(e.data)
      }
      mediaRecorder.value.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        questionBlobs.value[currentQuestion.value.id] = blob
        stopStreamTracks()
      }
      mediaRecorder.value.start()
      isRecording.value = true
    } catch (e) {
      recordError.value = 'Không thể truy cập microphone. Vui lòng cấp quyền và thử lại.'
      stopStreamTracks()
    }
  }

  function stopRecording() {
    if (!isRecording.value || !mediaRecorder.value) return
    mediaRecorder.value.stop()
    isRecording.value = false
  }

  function stopStreamTracks() {
    if (!mediaStream.value) return
    mediaStream.value.getTracks().forEach((t) => t.stop())
    mediaStream.value = null
  }

  function hasRecorded(questionId) {
    return Boolean(questionBlobs.value[questionId])
  }

  return {
    loading,
    error,
    speaking,
    currentPartIdx,
    currentPart,
    currentQuestionIdx,
    currentQuestion,
    currentQuestions,
    isRecording,
    recordError,
    questionBlobs,
    load,
    setPartIndex,
    setQuestionIndex,
    startRecording,
    stopRecording,
    hasRecorded,
  }
}
