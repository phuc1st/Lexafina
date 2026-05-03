<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import WritingPromptPanel from '../components/practice-writing/WritingPromptPanel.vue'
import WritingEditorPanel from '../components/practice-writing/WritingEditorPanel.vue'
import { useWritingPractice } from '../composables/useWritingPractice'
import { useUiStore } from '../stores/ui'
import { api } from '../services/api'

const route = useRoute()
const router = useRouter()
const ui = useUiStore()

const showReference = ref(false)
const {
  loading,
  error,
  writing,
  draftSections,
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

async function onComplete() {
  saveDraft()
  stopTimer()
  const qid = writing.value?.id
  if (qid == null) {
    ui.showToast('Thiếu mã đề, không thể gửi bài.', 'error')
    return
  }
  try {
    const d = draftSections.value
    await api.submitWriting({
      quizId: qid,
      introduction: d.introduction,
      overview: d.overview,
      body1: d.body1,
      body2: d.body2,
      wordCount: wordCount.value,
    })
    clearDraft()
    ui.showToast('Đã gửi bài Writing lên server.', 'success')
    router.push({ name: 'practice-list', params: { skill: 'writing' } })
  } catch (e) {
    ui.showToast(e?.message || 'Gửi bài thất bại.', 'error')
  }
}
</script>

<template>
  <AppLayout :title="pageTitle">
    <div v-if="loading" class="py-20 text-center text-slate-500">Đang tải đề writing...</div>
    <div v-else-if="error" class="py-20 text-center">
      <p class="text-sm font-semibold text-red-600">Không tải được đề: {{ error.message }}</p>
    </div>
    <div v-else-if="!writing" class="py-20 text-center text-slate-500">Không có dữ liệu đề.</div>

    <div
      v-else
      class="grid grid-cols-1 xl:grid-cols-2 gap-5 min-h-[72vh] xl:min-h-0 xl:h-[calc(100vh-7.5rem)]"
    >
      <div class="flex flex-col min-h-0 xl:h-full">
        <div
          class="flex-1 min-h-[320px] xl:min-h-0 overflow-y-auto overscroll-y-contain rounded-xl scrollbar-thin"
        >
          <WritingPromptPanel
            :prompt-title="writing.promptTitle"
            :prompt-html="writing.promptHtml"
            :instruction-html="writing.instructionHtml"
            :graph-image-url="writing.graphImageUrl"
            :graph-description="writing.graphDescription"
          />
        </div>
      </div>

      <div class="flex flex-col min-h-0 xl:h-full">
        <div
          class="flex-1 min-h-[320px] xl:min-h-0 overflow-y-auto overscroll-y-contain rounded-xl scrollbar-thin"
        >
          <WritingEditorPanel
            v-model="draftSections"
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
      </div>
    </div>
  </AppLayout>
</template>
