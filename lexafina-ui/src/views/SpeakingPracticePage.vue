<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import SpeakingPartTabs from '../components/practice-speaking/SpeakingPartTabs.vue'
import SpeakingQuestionNav from '../components/practice-speaking/SpeakingQuestionNav.vue'
import SpeakingQuestionPanel from '../components/practice-speaking/SpeakingQuestionPanel.vue'
import SpeakingRecorderPanel from '../components/practice-speaking/SpeakingRecorderPanel.vue'
import { useSpeakingPractice } from '../composables/useSpeakingPractice'
import { useUiStore } from '../stores/ui'

const route = useRoute()
const router = useRouter()
const ui = useUiStore()

const {
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
  load,
  setPartIndex,
  setQuestionIndex,
  startRecording,
  stopRecording,
  hasRecorded,
} = useSpeakingPractice()

const pageTitle = computed(() => speaking.value?.title || 'Speaking Practice')
const hasCurrentRecorded = computed(() => currentQuestion.value ? hasRecorded(currentQuestion.value.id) : false)

onMounted(async () => {
  await load(Number(route.params.quizId))
})

async function onStartRecording() {
  await startRecording()
}

function onStopRecording() {
  stopRecording()
  ui.showToast('Đã lưu bản ghi câu hiện tại (MVP local).', 'success')
}

function goBackList() {
  router.push({ name: 'practice-list', params: { skill: 'speaking' } })
}
</script>

<template>
  <AppLayout :title="pageTitle">
    <div v-if="loading" class="py-20 text-center text-slate-500">Đang tải đề speaking...</div>
    <div v-else-if="error" class="py-20 text-center">
      <p class="text-sm font-semibold text-red-600">Không tải được đề: {{ error.message }}</p>
    </div>
    <div v-else-if="!speaking" class="py-20 text-center text-slate-500">Không có dữ liệu đề.</div>

    <div v-else class="space-y-4">
      <header class="flex items-center justify-between gap-3 flex-wrap">
        <SpeakingPartTabs
          :parts="speaking.parts"
          :current-index="currentPartIdx"
          @change="setPartIndex"
        />
        <button
          class="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          @click="goBackList"
        >
          ← Về danh sách
        </button>
      </header>

      <div class="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 min-h-[65vh]">
        <div class="space-y-4">
          <div v-if="currentPart?.instructionHtml" class="bg-white border border-slate-200 rounded-xl p-4">
            <p class="text-xs font-semibold text-slate-500 mb-2">Instruction</p>
            <div class="prose prose-sm max-w-none" v-html="currentPart.instructionHtml" />
          </div>

          <SpeakingQuestionPanel :question="currentQuestion" />
          <SpeakingRecorderPanel
            :is-recording="isRecording"
            :has-current-recorded="hasCurrentRecorded"
            :error="recordError"
            @start="onStartRecording"
            @stop="onStopRecording"
          />
        </div>

        <SpeakingQuestionNav
          :questions="currentQuestions"
          :current-index="currentQuestionIdx"
          :has-recorded="hasRecorded"
          @change="setQuestionIndex"
        />
      </div>
    </div>
  </AppLayout>
</template>
