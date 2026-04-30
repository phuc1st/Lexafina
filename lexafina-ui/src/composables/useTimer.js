import { ref, computed, onUnmounted } from 'vue'

/**
 * Countdown timer composable.
 * @param {number} durationSec - tổng số giây ban đầu
 * @param {Function} onTimeUp  - callback khi đếm về 0
 */
export function useTimer(durationSec, onTimeUp) {
  const total = ref(durationSec)
  const remaining = ref(durationSec)
  const running = ref(false)
  let intervalId = null

  const formatted = computed(() => {
    const s = Math.max(0, remaining.value)
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${mm}:${ss}`
  })

  // Số giây đã trôi qua từ lúc start (dùng cho ResultPage hiển thị "thời gian làm bài")
  const elapsed = computed(() => Math.max(0, total.value - remaining.value))

  function start() {
    if (running.value) return
    running.value = true
    intervalId = setInterval(() => {
      remaining.value -= 1
      if (remaining.value <= 0) {
        stop()
        if (typeof onTimeUp === 'function') onTimeUp()
      }
    }, 1000)
  }

  function stop() {
    running.value = false
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function reset(newDuration = durationSec) {
    stop()
    total.value = newDuration
    remaining.value = newDuration
  }

  onUnmounted(stop)

  return { remaining, total, elapsed, formatted, running, start, stop, reset }
}
