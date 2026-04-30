<script setup>
/** Skeleton placeholder cho card khi đang load */
defineProps({
  lines: { type: Number, default: 3 },
})
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-100 shadow-card p-5 animate-skeleton">
    <div class="h-4 bg-slate-100 rounded w-3/4 mb-3" />
    <div v-for="i in lines" :key="i" :class="['h-3 bg-slate-100 rounded mb-2', i === lines ? 'w-1/2' : 'w-full']" />
    <div class="h-8 bg-slate-100 rounded-lg mt-4 w-full" />
  </div>
</template>
