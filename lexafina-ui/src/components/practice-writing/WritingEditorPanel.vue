<script setup>
import WordCountBadge from './WordCountBadge.vue'

defineProps({
  modelValue: { type: String, default: '' },
  wordCount: { type: Number, default: 0 },
  minWords: { type: Number, default: 120 },
  maxWords: { type: Number, default: 400 },
  timer: { type: String, default: '00:00' },
  logicalFrames: { type: Array, default: () => [] },
  showReference: { type: Boolean, default: false },
})

defineEmits(['update:modelValue', 'save', 'complete', 'toggle-reference'])
</script>

<template>
  <section class="bg-white border border-slate-200 rounded-xl p-5 h-full flex flex-col gap-4">
    <header class="flex items-center justify-between flex-wrap gap-2">
      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold text-slate-700">Thời gian còn lại:</span>
        <span class="px-2 py-1 rounded-md bg-brand-50 text-brand-700 font-bold text-sm">{{ timer }}</span>
      </div>
      <WordCountBadge :value="wordCount" :min="minWords" :max="maxWords" />
    </header>

    <textarea
      class="flex-1 min-h-[260px] rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
      :value="modelValue"
      placeholder="Nhập bài viết của bạn ở đây..."
      @input="$emit('update:modelValue', $event.target.value)"
    />

    <div class="flex items-center justify-between gap-2 flex-wrap">
      <button
        class="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
        @click="$emit('toggle-reference')"
      >
        {{ showReference ? 'Ẩn' : 'Hiện' }} tham khảo
      </button>

      <div class="flex items-center gap-2">
        <button
          class="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          @click="$emit('save')"
        >
          Lưu nháp
        </button>
        <button
          class="px-3 py-2 text-xs font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700"
          @click="$emit('complete')"
        >
          Hoàn thành
        </button>
      </div>
    </div>

    <section v-if="showReference && logicalFrames.length" class="border-t border-slate-100 pt-3 space-y-3">
      <h4 class="text-sm font-semibold text-slate-700">Reference</h4>
      <div
        v-for="frame in logicalFrames"
        :key="frame.id"
        class="rounded-lg border border-slate-100 p-3"
      >
        <p class="text-xs font-semibold text-slate-500 mb-1">{{ frame.name }}</p>
        <div class="prose prose-sm max-w-none" v-html="frame.html" />
      </div>
    </section>
  </section>
</template>
