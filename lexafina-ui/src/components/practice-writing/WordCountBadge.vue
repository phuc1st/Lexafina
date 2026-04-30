<script setup>
const props = defineProps({
  value: { type: Number, default: 0 },
  min: { type: Number, default: 120 },
  max: { type: Number, default: 400 },
})
</script>

<template>
  <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
    :class="[
      value < min ? 'bg-red-50 text-red-600' : value > max ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-700',
    ]"
  >
    <span>{{ value }} từ</span>
    <span class="opacity-70">({{ min }}-{{ max }})</span>
  </div>
</template>
