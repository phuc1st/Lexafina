<script setup>
defineProps({
  isRecording: { type: Boolean, default: false },
  hasCurrentRecorded: { type: Boolean, default: false },
  error: { type: String, default: '' },
})
defineEmits(['start', 'stop'])
</script>

<template>
  <section class="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
    <div class="flex items-center justify-between">
      <p class="text-sm font-semibold text-slate-700">Recorder</p>
      <span
        class="text-xs font-semibold px-2 py-1 rounded-full"
        :class="isRecording ? 'bg-red-50 text-red-600' : hasCurrentRecorded ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
      >
        {{ isRecording ? 'Đang ghi...' : hasCurrentRecorded ? 'Đã ghi' : 'Chưa ghi' }}
      </span>
    </div>

    <div class="h-16 rounded-lg border border-dashed border-slate-200 bg-slate-50 grid place-items-center text-xs text-slate-400">
      Waveform preview (MVP)
    </div>

    <div class="flex items-center gap-2">
      <button
        v-if="!isRecording"
        class="px-3 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
        @click="$emit('start')"
      >
        Start recording
      </button>
      <button
        v-else
        class="px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
        @click="$emit('stop')"
      >
        Stop recording
      </button>
    </div>

    <p v-if="error" class="text-xs font-medium text-red-600">{{ error }}</p>
  </section>
</template>
