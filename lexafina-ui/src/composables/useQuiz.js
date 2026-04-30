import { ref, reactive, computed } from 'vue'
import { api } from '../services/api'

/**
 * Composable quản lý trạng thái 1 quiz đang làm.
 *
 * Dữ liệu backend trả về có cấu trúc:
 *   data.parts[].question_sets[].questions[]
 *
 * Composable này:
 * - Fetch quiz
 * - Phẳng hoá toàn bộ câu hỏi để đánh số liên tục (1..N)
 * - Quản lý answers theo questionId (reactive)
 * - Cung cấp helper: setAnswer / submit
 */
export function useQuiz() {
  const quiz = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Map<questionId, string> – string vì MULTIPLE_CHOICE_MANY join thành "A,E"
  const answers = reactive({})

  // Phẳng hoá toàn bộ câu hỏi.
  // Giữ globalIndex cho internal fallback, nhưng UI numbering ưu tiên order từ data source.
  const flatQuestions = computed(() => {
    if (!quiz.value) return []
    const out = []
    let idx = 1
    for (const part of quiz.value.parts || []) {
      for (const qs of part.question_sets || []) {
        for (const q of qs.questions || []) {
          const displayOrderLabel = buildDisplayOrderLabel(q)
          out.push({
            ...q,
            globalIndex: idx++,
            displayOrderLabel,
            partId: part.id,
            questionSet: { id: qs.id, type: qs.question_type, options: qs.options },
          })
        }
      }
    }
    return out
  })

  const totalQuestions = computed(() => flatQuestions.value.length)

  const answeredCount = computed(() =>
    flatQuestions.value.filter((q) => {
      const v = answers[q.id]
      return v !== undefined && v !== null && v !== ''
    }).length
  )

  async function load(quizId) {
    loading.value = true
    error.value = null
    try {
      quiz.value = await api.getQuiz(quizId)
      Object.keys(answers).forEach((k) => delete answers[k])
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  function setAnswer(questionId, value) {
    answers[questionId] = value
  }

  // Build payload và gửi lên backend.
  async function submit() {
    if (!quiz.value) throw new Error('Quiz not loaded')
    const payload = Object.entries(answers)
      .filter(([, v]) => v !== '' && v !== null && v !== undefined)
      .map(([qid, v]) => ({ questionId: Number(qid), answer: String(v) }))
    return api.submit(quiz.value.id, payload)
  }

  function buildDisplayOrderLabel(question) {
    const start = Number(question?.order)
    if (!Number.isFinite(start)) return String(question?.globalIndex ?? '')

    // Case đặc biệt: 1 question object đại diện nhiều số (vd 23-24)
    if (
      question?.question_type === 'MULTIPLE_CHOICE_MANY' &&
      Array.isArray(question?.correct_answers) &&
      question.correct_answers.length > 1
    ) {
      const end = start + question.correct_answers.length - 1
      return `${start}-${end}`
    }

    return String(start)
  }

  return {
    quiz,
    loading,
    error,
    answers,
    flatQuestions,
    totalQuestions,
    answeredCount,
    load,
    setAnswer,
    submit,
  }
}
