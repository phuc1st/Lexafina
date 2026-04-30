<script setup>
defineProps({
  question: { type: Object, default: null },
})
</script>

<template>
  <section class="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
    <p class="text-xs font-semibold text-slate-500">Current question</p>
    <h3 class="text-base font-bold text-slate-900">{{ question?.title || 'Không có câu hỏi' }}</h3>
    <div
      v-if="question?.description"
      class="prose prose-sm max-w-none text-slate-600"
      v-html="question.description"
    />
    <div class="flex items-center gap-3 text-xs text-slate-500">
      <span>Think: {{ question?.thinkTime || 0 }}s</span>
      <span>Answer: {{ question?.timeLimit || 30 }}s</span>
    </div>
  </section>
</template>
