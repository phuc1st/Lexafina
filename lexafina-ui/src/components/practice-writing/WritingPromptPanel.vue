<script setup>
defineProps({
  promptTitle: { type: String, default: '' },
  promptHtml: { type: String, default: '' },
  instructionHtml: { type: String, default: '' },
  graphImageUrl: { type: String, default: '' },
  graphDescription: { type: String, default: '' },
})
</script>

<template>
  <section class="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
    <!-- <h3 class="text-base font-bold text-slate-900">{{ promptTitle }}</h3> -->
    <div v-if="promptHtml" class="prose prose-sm max-w-none" v-html="promptHtml" />
    <div v-if="graphImageUrl" class="space-y-2">
      <img :src="graphImageUrl" alt="Writing graph" class="w-full rounded-lg border border-slate-200" />
      <!-- <p v-if="graphDescription" class="text-xs text-slate-500 whitespace-pre-line">{{ graphDescription }}</p> -->
    </div>

  
    <div v-if="instructionHtml" class="prose prose-sm max-w-none border-t border-slate-100 pt-4" v-html="instructionHtml" />
  </section>
</template>
