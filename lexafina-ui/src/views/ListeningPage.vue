<script setup>
import { onMounted, ref, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import QuestionList from '../components/practice/QuestionList.vue'
import AnswerSheet from '../components/practice/AnswerSheet.vue'
import Timer from '../components/practice/Timer.vue'
import PartTabs from '../components/practice/PartTabs.vue'
import SubmitModal from '../components/practice/SubmitModal.vue'
import ListeningBottomPlayer from '../components/practice/ListeningBottomPlayer.vue'

import { useQuiz } from '../composables/useQuiz'
import { useTimer } from '../composables/useTimer'
import { audioUrl } from '../services/assets'
import { extractLocateRanges } from '../services/locateInfo'
import {
  attachGlobalTime,
  buildListeningTranscriptRows,
  buildPartOffsets,
} from '../services/listeningTranscript'

const route = useRoute()
const router = useRouter()

const {
  quiz, loading, error, answers,
  flatQuestions, totalQuestions, answeredCount,
  load, setAnswer, submit,
} = useQuiz()

const currentPartIdx = ref(0)
const currentPart = computed(() => quiz.value?.parts?.[currentPartIdx.value])
const playerRef = ref(null)

const isReview = computed(() => route.query.mode === 'review')
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
const globalAudioTime = ref(0)
const durationByTrack = ref({})

function resolvePartAudioSrc(p) {
  if (!p) return ''
  if (p.file_id) return audioUrl(p.file_id)
  if (p.audio_url) return p.audio_url
  if (p.audio) return typeof p.audio === 'string' ? p.audio : p.audio.url || ''
  if (Array.isArray(p.audios) && p.audios.length) {
    const first = p.audios[0]
    return first.url || (first.file_id ? audioUrl(first.file_id) : '')
  }
  return ''
}

// Full test: gộp nhiều part thành 1 playlist/timeline global.
// Single part: playlist chỉ có 1 track.
const audioTracks = computed(() => {
  const parts = (quiz.value?.parts || [])
    .slice()
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
  return parts
    .map((p, idx) => ({
      id: p.id || idx,
      title: p.title || `Listening Passage ${idx + 1}`,
      src: resolvePartAudioSrc(p),
    }))
    .filter((t) => Boolean(t.src))
})
const trackCount = computed(() => audioTracks.value.length)
const partOffsets = computed(() => buildPartOffsets(durationByTrack.value, trackCount.value))
const trackIndexByPartId = computed(() => {
  const map = {}
  const sortedParts = (quiz.value?.parts || [])
    .slice()
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
  sortedParts.forEach((p, i) => {
    map[p.id] = i
  })
  return map
})

const transcriptRows = computed(() => {
  if (!currentPart.value) return []
  const trackIndex = trackIndexByPartId.value[currentPart.value.id] ?? 0
  const localRows = buildListeningTranscriptRows(currentPart.value, trackIndex)
  return attachGlobalTime(localRows, partOffsets.value)
})
const transcriptDisplayRows = computed(() => {
  let prevSpeaker = null
  return transcriptRows.value.map((row) => {
    const s = (row.speaker || '').trim()
    const showSpeaker = Boolean(s) && s !== prevSpeaker
    prevSpeaker = s || prevSpeaker
    return {
      ...row,
      showSpeaker,
    }
  })
})

const activeTranscriptRowId = computed(() => {
  const t = globalAudioTime.value
  if (!Number.isFinite(t)) return null
  const row = transcriptRows.value.find((r) => {
    if (r.globalFrom == null || r.globalTo == null) return false
    return t >= r.globalFrom && t <= r.globalTo + 0.08
  })
  return row?.id || null
})

const referencedTranscriptRowIds = computed(() => {
  if (!isReview.value || !selectedQuestion.value) return new Set()
  const ranges = extractLocateRanges(selectedQuestion.value.locate_info)
  if (!ranges.length) return new Set()

  const ids = new Set()
  for (const row of transcriptRows.value) {
    for (const range of ranges) {
      const sp = Number(range.start?.paragraph)
      const ep = Number(range.end?.paragraph)
      const ss = Number(range.start?.sentence)
      const es = Number(range.end?.sentence)
      if (
        row.paragraphIndex < sp ||
        row.paragraphIndex > ep ||
        !Number.isFinite(ss) ||
        !Number.isFinite(es)
      ) {
        continue
      }
      if (sp === ep) {
        if (row.sentenceIndex >= ss && row.sentenceIndex <= es) ids.add(row.id)
      } else if (row.paragraphIndex === sp) {
        if (row.sentenceIndex >= ss) ids.add(row.id)
      } else if (row.paragraphIndex === ep) {
        if (row.sentenceIndex <= es) ids.add(row.id)
      } else {
        ids.add(row.id)
      }
    }
  }
  return ids
})

const {
  formatted: timeFormatted,
  remaining: timeRemaining,
  elapsed: timeElapsed,
  start: startTimer,
  stop: stopTimer,
  reset: resetTimer,
} = useTimer(30 * 60, handleTimeUp)

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
    for (const d of reviewResult.value.details || []) {
      if (d.user_answer != null) setAnswer(d.question_id, d.user_answer)
    }
    const firstWithExplain = flatQuestions.value.find((q) => q.explain) || flatQuestions.value[0]
    if (firstWithExplain) selectedQuestionId.value = firstWithExplain.id
  } else {
    resetTimer((quiz.value.time || 30) * 60)
    startTimer()
  }
})

async function doSubmit() {
  if (submitting.value) return
  submitting.value = true
  try {
    const result = await submit()
    stopTimer()
    const enriched = { ...result, used_seconds: timeElapsed.value, skill: 'listening' }
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
  if (!isReview.value) {
    document.getElementById(`q-${questionId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  selectedQuestionId.value = questionId
}

function onSelectQuestion(qid) {
  selectedQuestionId.value = qid
}

function onPlayerTimeChange(v) {
  globalAudioTime.value = Number(v || 0)
}
function onDurationsChange(map) {
  durationByTrack.value = map || {}
}
function seekToTranscriptRow(row) {
  if (!row || row.globalFrom == null) return
  playerRef.value?.seekGlobal(row.globalFrom)
}

watch([selectedQuestion, transcriptRows], ([q, rows]) => {
  if (!isReview.value || !q || !rows.length) return
  const firstRef = rows.find((r) => referencedTranscriptRowIds.value.has(r.id))
  if (!firstRef) return
  requestAnimationFrame(() => {
    document.getElementById(`ts-${firstRef.id}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  })
})
</script>

<template>
  <div v-if="loading" class="state">Đang tải đề...</div>
  <div v-else-if="error" class="state state--err">Lỗi: {{ error.message }}</div>

  <div v-else-if="quiz" class="listen-page">
    <header class="listen-header">
      <div class="listen-header__left">
        <div class="brand">Lexafina · Listening · {{ quiz.title }}</div>
      </div>
      <div class="listen-header__right">
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
        <button v-else class="btn-back" @click="backToResult">← Về tổng kết</button>
      </div>
    </header>

    <main v-if="!isReview" class="listen-main">
      <section class="listen-content">
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
      </section>

      <aside class="listen-sheet">
        <AnswerSheet
          :flat-questions="flatQuestions"
          :answers="answers"
          :parts="quiz.parts"
          :review-mode="isReview"
          :result-details="resultDetails"
          :selected-question-id="selectedQuestionId"
          @jump="jumpToQuestion"
        />
      </aside>
    </main>

    <main v-else class="review-main">
      <section class="review-script">
        <h3 class="review-script__title">{{ currentPart?.title || 'Transcript' }}</h3>
        <div class="review-script__list">
          <div
            v-for="row in transcriptDisplayRows"
            :id="`ts-${row.id}`"
            :key="row.id"
            class="line"
            :class="{
              'line--active': activeTranscriptRowId === row.id,
              'line--ref': referencedTranscriptRowIds.has(row.id),
              'line--seekable': row.globalFrom != null,
            }"
            @click="seekToTranscriptRow(row)"
          >
            <div v-if="row.showSpeaker" class="line__speaker">{{ row.speaker }}</div>
            <div class="line__text">{{ row.text }}</div>
          </div>
        </div>
      </section>

      <section class="review-questions">
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
      </section>

      <aside class="review-sheet">
        <AnswerSheet
          :flat-questions="flatQuestions"
          :answers="answers"
          :parts="quiz.parts"
          :review-mode="isReview"
          :result-details="resultDetails"
          :selected-question-id="selectedQuestionId"
          @jump="jumpToQuestion"
        />
      </aside>
    </main>

    <ListeningBottomPlayer
      ref="playerRef"
      :tracks="audioTracks"
      @time-change="onPlayerTimeChange"
      @durations-change="onDurationsChange"
    />
  </div>

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

.listen-page {
  min-height: 100vh;
  background: #f3f6fb;
  padding-bottom: 96px; /* chừa chỗ cho bottom player fixed */
}
.listen-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.listen-header__left .brand {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}
.listen-header__right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.listen-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 16px;
}
.review-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr 260px;
  gap: 16px;
  height: calc(100vh - 172px);
  overflow: hidden;
}
.listen-content {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px 20px 28px;
}
.review-script {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 16px;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.review-script__title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}
.review-script__list {
  overflow-y: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.line {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px;
  align-items: baseline;
}
.line__speaker {
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  min-width: 70px;
}
.line__text {
  font-size: 13px;
  line-height: 1.5;
  color: #1f2937;
}
.line--seekable {
  cursor: pointer;
}
.line--seekable:hover {
  background: #f9fafb;
}
.line--active {
  border-color: #fb923c;
  background: #fff7ed;
}
.line--ref {
  box-shadow: inset 0 0 0 1px #facc15;
  background: #fefce8;
}
.review-questions {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 18px;
  min-height: 0;
  height: 100%;
  overflow-y: auto;
}
.review-sheet {
  min-width: 240px;
}
.review-sheet :deep(.sheet) {
  position: sticky;
  top: 12px;
  max-height: calc(100vh - 240px);
  overflow-y: auto;
}
.listen-sheet {
  min-width: 240px;
}
.listen-explain {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px 12px;
}
.transcript {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 18px;
  flex: 1;
  overflow-y: auto;
}
.transcript summary {
  cursor: pointer;
  font-weight: 600;
  color: #1e40af;
}
.transcript__body {
  padding-top: 12px;
  line-height: 1.6;
}

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

@media (max-width: 1024px) {
  .listen-main {
    grid-template-columns: 1fr;
  }
  .review-main {
    grid-template-columns: 1fr;
    height: auto;
    overflow: visible;
  }
  .review-script,
  .review-questions {
    height: auto;
    min-height: 340px;
  }
}
</style>
