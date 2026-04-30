<script setup>
import { computed } from 'vue'

/**
 * Pure UI – chỉ hiển thị thời gian.
 * Logic countdown nằm ở composable useTimer (đặt trong page).
 */
const props = defineProps({
  formatted: { type: String, required: true },
  remaining: { type: Number, required: true },
})

const danger = computed(() => props.remaining <= 60)
const warn = computed(() => props.remaining <= 300 && props.remaining > 60)
</script>

<template>
  <div
    class="timer"
    :class="{ 'timer--danger': danger, 'timer--warn': warn }"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2M9 2h6" />
    </svg>
    <span>{{ formatted }}</span>
  </div>
</template>

<style scoped>
.timer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1e40af;
  font-weight: 700;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
}
.timer--warn { background: #fef3c7; color: #92400e; }
.timer--danger {
  background: #fee2e2;
  color: #991b1b;
  animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
</style>
