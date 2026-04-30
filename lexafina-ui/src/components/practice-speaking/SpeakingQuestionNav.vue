<script setup>
defineProps({
  questions: { type: Array, default: () => [] },
  currentIndex: { type: Number, default: 0 },
  hasRecorded: { type: Function, default: () => false },
})
defineEmits(['change'])
</script>

<template>
  <aside class="bg-white border border-slate-200 rounded-xl p-3 space-y-2 overflow-y-auto scrollbar-thin">
    <p class="text-xs font-semibold text-slate-500">Question list</p>
    <button
      v-for="(q, idx) in questions"
      :key="q.id || idx"
      class="w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors"
      :class="[
        currentIndex === idx ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-100 text-slate-600 hover:bg-slate-50',
      ]"
      @click="$emit('change', idx)"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="truncate">Q{{ idx + 1 }}. {{ q.title }}</span>
        <span
          class="shrink-0 w-2 h-2 rounded-full"
          :class="hasRecorded(q.id) ? 'bg-emerald-500' : 'bg-slate-300'"
        />
      </div>
    </button>
  </aside>
</template>
