<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import WritingPromptPanel from '../components/practice-writing/WritingPromptPanel.vue'
import WritingEditorPanel from '../components/practice-writing/WritingEditorPanel.vue'
import { useWritingPractice } from '../composables/useWritingPractice'
import { useUiStore } from '../stores/ui'

const route = useRoute()
const router = useRouter()
const ui = useUiStore()

const showReference = ref(false)
const {
  loading,
  error,
  writing,
  draftText,
  wordCount,
  timerFormatted,
  stopTimer,
  load,
  saveDraft,
  clearDraft,
} = useWritingPractice()

const pageTitle = computed(() => writing.value?.title || 'Writing Practice')

onMounted(async () => {
  await load(Number(route.params.quizId))
})

function onSaveDraft() {
  saveDraft()
  ui.showToast('Đã lưu nháp', 'success')
}

function onComplete() {
  saveDraft()
  stopTimer()
  ui.showToast('Đã hoàn thành phiên luyện Writing (MVP local).', 'info')
  router.push({ name: 'practice-list', params: { skill: 'writing' } })
}
</script>

<template>
  <AppLayout :title="pageTitle">
    <div v-if="loading" class="py-20 text-center text-slate-500">Đang tải đề writing...</div>
    <div v-else-if="error" class="py-20 text-center">
      <p class="text-sm font-semibold text-red-600">Không tải được đề: {{ error.message }}</p>
    </div>
    <div v-else-if="!writing" class="py-20 text-center text-slate-500">Không có dữ liệu đề.</div>

    <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-5 min-h-[72vh]">
      <WritingPromptPanel
        :prompt-title="writing.promptTitle"
        :prompt-html="writing.promptHtml"
        :instruction-html="writing.instructionHtml"
        :graph-image-url="writing.graphImageUrl"
        :graph-description="writing.graphDescription"
      />

      <WritingEditorPanel
        v-model="draftText"
        :word-count="wordCount"
        :min-words="writing.minWords"
        :max-words="writing.maxWords"
        :timer="timerFormatted"
        :logical-frames="writing.logicalFrames"
        :show-reference="showReference"
        @toggle-reference="showReference = !showReference"
        @save="onSaveDraft"
        @complete="onComplete"
      />
    </div>
  </AppLayout>
</template>
