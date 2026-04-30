<script setup>
defineProps({
  parts: { type: Array, default: () => [] },
  currentIndex: { type: Number, default: 0 },
})
defineEmits(['change'])
</script>

<template>
  <div class="flex items-center gap-2 flex-wrap">
    <button
      v-for="(p, idx) in parts"
      :key="p.id || idx"
      class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
      :class="currentIndex === idx ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-400'"
      @click="$emit('change', idx)"
    >
      {{ p.title }}
    </button>
  </div>
</template>
