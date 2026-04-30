<script setup>
import { onMounted, ref, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PracticeLayout from '../components/practice/PracticeLayout.vue'
import ReadingPassageViewer from '../components/practice/ReadingPassageViewer.vue'
import QuestionList from '../components/practice/QuestionList.vue'
import AnswerSheet from '../components/practice/AnswerSheet.vue'
import Timer from '../components/practice/Timer.vue'
import PartTabs from '../components/practice/PartTabs.vue'
import SubmitModal from '../components/practice/SubmitModal.vue'
import ExplanationPanel from '../components/practice/ExplanationPanel.vue'

import { useQuiz } from '../composables/useQuiz'
import { useTimer } from '../composables/useTimer'
import { buildReadingPartViewModel } from '../services/readingPassage'
import { extractLocateRanges } from '../services/locateInfo'

const route = useRoute()
const router = useRouter()

const {
  quiz, loading, error, answers,
  flatQuestions, totalQuestions, answeredCount,
  load, setAnswer, submit,
} = useQuiz()

// Quiz có nhiều part (full = 4 parts, quiz lẻ = 1 part)
const currentPartIdx = ref(0)
const currentPart = computed(() => quiz.value?.parts?.[currentPartIdx.value])

// Normalize part hiện tại thành ViewModel cho ReadingPassageViewer.
const passageVm = computed(() => buildReadingPartViewModel(currentPart.value))

const isReview = computed(() => route.query.mode === 'review')
const passageRef = ref(null)

// Map<questionId, { is_correct, user_answer }> – build từ result trong sessionStorage
const reviewResult = ref(null)
const resultDetails = computed(() => {
  if (!reviewResult.value) return {}
  const map = {}
  for (const d of reviewResult.value.details || []) {
    map[d.question_id] = d
  }
  return map
})

const selectedQuestionId = ref(null)
const selectedQuestion = computed(() =>
  flatQuestions.value.find((q) => q.id === selectedQuestionId.value) || null
)
const selectedDetail = computed(() =>
  selectedQuestionId.value != null ? resultDetails.value[selectedQuestionId.value] : null
)

// IELTS Reading 60 phút – tạm fixed; có thể đọc từ quiz.value.time (phút)
const {
  formatted: timeFormatted,
  remaining: timeRemaining,
  elapsed: timeElapsed,
  start: startTimer,
  stop: stopTimer,
  reset: resetTimer,
} = useTimer(60 * 60, handleTimeUp)

const showSubmitModal = ref(false)
const submitting = ref(false)

onMounted(async () => {
  const quizId = Number(route.params.quizId)

  if (isReview.value) {
    const r = sessionStorage.getItem('lexafina:lastResult')
    if (r) reviewResult.value = JSON.parse(r)
  }

  await load(quizId)
  if (!quiz.value) return

  if (isReview.value && reviewResult.value) {
    // Pre-fill answers từ kết quả đã submit
    for (const d of reviewResult.value.details || []) {
      if (d.user_answer != null) setAnswer(d.question_id, d.user_answer)
    }
    // Auto-select câu đầu tiên có giải thích để mở panel
    const firstWithExplain = flatQuestions.value.find((q) => q.explain) || flatQuestions.value[0]
    if (firstWithExplain) selectedQuestionId.value = firstWithExplain.id
  } else {
    resetTimer((quiz.value.time || 60) * 60)
    startTimer()
  }
})

async function doSubmit() {
  if (submitting.value) return
  submitting.value = true
  try {
    const result = await submit()
    stopTimer()
    const enriched = { ...result, used_seconds: timeElapsed.value, skill: 'reading' }
    sessionStorage.setItem('lexafina:lastResult', JSON.stringify(enriched))
    sessionStorage.setItem('lexafina:lastQuiz', JSON.stringify(quiz.value))
    router.push({ name: 'result', params: { quizId: quiz.value.id } })
  } catch (e) {
    alert('Submit failed: ' + e.message)
  } finally {
    submitting.value = false
    showSubmitModal.value = false
  }
}

function handleTimeUp() {
  alert('Hết giờ! Hệ thống sẽ tự nộp bài.')
  doSubmit()
}

function backToResult() {
  router.push({ name: 'result', params: { quizId: quiz.value?.id || route.params.quizId } })
}

async function jumpToQuestion(questionId) {
  const q = flatQuestions.value.find((x) => x.id === questionId)
  if (!q) return
  const partIdx = quiz.value.parts.findIndex((p) => p.id === q.partId)
  if (partIdx >= 0 && partIdx !== currentPartIdx.value) {
    currentPartIdx.value = partIdx
    await nextTick()
  }
  document.getElementById(`q-${questionId}`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  if (isReview.value) selectedQuestionId.value = questionId
}

function onSelectQuestion(qid) {
  selectedQuestionId.value = qid
}

function onLocateInPassage(question) {
  if (!question) return
  const ranges = extractLocateRanges(question?.locate_info)
  if (passageRef.value && ranges?.length) {
    passageRef.value.highlightRange(ranges)
  }
}

// Trong review mode, mỗi khi đổi câu đang chọn → tự highlight luôn passage
watch(selectedQuestion, (q) => {
  if (!isReview.value) return
  if (!passageRef.value) return
  if (!q) {
    passageRef.value.clearHighlight()
    return
  }
  const ranges = extractLocateRanges(q?.locate_info)
  if (ranges?.length) passageRef.value.highlightRange(ranges)
  else passageRef.value.clearHighlight()
})
</script>

<template>
  <div v-if="loading" class="state">Đang tải đề...</div>
  <div v-else-if="error" class="state state--err">Lỗi: {{ error.message }}</div>

  <PracticeLayout v-else-if="quiz" :title="`Reading · ${quiz.title}`">
    <template #header>
      <PartTabs
        v-if="quiz.parts.length > 1"
        :parts="quiz.parts"
        :current-idx="currentPartIdx"
        @change="(i) => currentPartIdx = i"
      />
      <Timer
        v-if="!isReview"
        :formatted="timeFormatted"
        :remaining="timeRemaining"
      />
      <span v-else class="review-tag">Chế độ xem giải thích</span>

      <button
        v-if="!isReview"
        class="btn-submit"
        @click="showSubmitModal = true"
      >
        Nộp bài
      </button>
      <button
        v-else
        class="btn-back"
        @click="backToResult"
      >
        ← Về tổng kết
      </button>
    </template>

    <template #left>
      <ReadingPassageViewer v-if="passageVm" ref="passageRef" :vm="passageVm" />
    </template>

    <template #right>
      <QuestionList
        v-if="currentPart"
        :part="currentPart"
        :answers="answers"
        :flat-questions="flatQuestions"
        :disabled="isReview"
        :review-mode="isReview"
        :result-details="resultDetails"
        :selected-question-id="selectedQuestionId"
        @update:answer="({ questionId, value }) => setAnswer(questionId, value)"
        @select-question="onSelectQuestion"
      />
    </template>

    <template v-if="isReview" #explain>
      <ExplanationPanel
        :question="selectedQuestion"
        :user-answer="selectedQuestionId != null ? (answers[selectedQuestionId] || '') : ''"
        :is-correct="Boolean(selectedDetail?.is_correct)"
        @locate="onLocateInPassage"
        @close="selectedQuestionId = null"
      />
    </template>

    <template #sheet>
      <AnswerSheet
        :flat-questions="flatQuestions"
        :answers="answers"
        :parts="quiz.parts"
        :review-mode="isReview"
        :result-details="resultDetails"
        :selected-question-id="selectedQuestionId"
        @jump="jumpToQuestion"
      />
    </template>
  </PracticeLayout>

  <SubmitModal
    :open="showSubmitModal"
    :answered="answeredCount"
    :total="totalQuestions"
    @cancel="showSubmitModal = false"
    @confirm="doSubmit"
  />
</template>

<style scoped>
.state {
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-size: 16px;
  color: #6b7280;
}
.state--err { color: #b91c1c; }

.btn-submit {
  padding: 9px 20px;
  background: #16a34a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.btn-submit:hover { background: #15803d; }

.btn-back {
  padding: 9px 16px;
  background: #fff;
  color: #c2410c;
  border: 1px solid #fdba74;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.btn-back:hover { background: #fff7ed; }

.review-tag {
  padding: 6px 12px;
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fdba74;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}
</style>
