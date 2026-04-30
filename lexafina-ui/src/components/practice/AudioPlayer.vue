<script setup>
import { ref, watch } from 'vue'

/**
 * Listening-only: <audio> + custom progress bar.
 * Trong IELTS thật audio chỉ phát 1 lần — prop `playOnce` để khoá replay.
 */
const props = defineProps({
  src: { type: String, required: true },
  title: { type: String, default: 'Audio' },
  playOnce: { type: Boolean, default: false },
})

const audio = ref(null)
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const hasPlayed = ref(false)

function togglePlay() {
  if (!audio.value) return
  if (props.playOnce && hasPlayed.value && !playing.value) return
  playing.value ? audio.value.pause() : audio.value.play()
}

function onTimeUpdate() {
  if (!audio.value) return
  currentTime.value = audio.value.currentTime
}
function onLoaded() {
  duration.value = audio.value?.duration || 0
}
function onPlay() {
  playing.value = true
  hasPlayed.value = true
}
function onPause() { playing.value = false }
function onEnded() { playing.value = false }

function fmt(s) {
  if (!s || isNaN(s)) return '00:00'
  const m = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(Math.floor(s % 60)).padStart(2, '0')
  return `${m}:${ss}`
}

// Reset khi đổi src
watch(() => props.src, () => {
  hasPlayed.value = false
  playing.value = false
  currentTime.value = 0
})
</script>

<template>
  <div class="player">
    <div class="player__title">{{ title }}</div>
    <audio
      ref="audio"
      :src="src"
      preload="metadata"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoaded"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
    />

    <div class="player__row">
      <button class="play-btn" @click="togglePlay" :disabled="playOnce && hasPlayed && !playing">
        <svg v-if="!playing" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
        </svg>
      </button>

      <div class="bar">
        <div
          class="bar__fill"
          :style="{ width: duration ? (currentTime / duration * 100) + '%' : '0%' }"
        />
      </div>

      <span class="time">{{ fmt(currentTime) }} / {{ fmt(duration) }}</span>
    </div>

    <p v-if="playOnce" class="hint">Audio chỉ phát 1 lần — như thi thật.</p>
  </div>
</template>

<style scoped>
.player {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.player__title {
  font-weight: 700;
  font-size: 14px;
  color: #111827;
}
.player__row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.play-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #2563eb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.play-btn:hover:not(:disabled) { background: #1e40af; }
.play-btn:disabled { background: #9ca3af; cursor: not-allowed; }
.bar {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}
.bar__fill {
  height: 100%;
  background: #2563eb;
  transition: width 0.2s linear;
}
.time {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: #6b7280;
  min-width: 90px;
  text-align: right;
}
.hint { margin: 0; font-size: 12px; color: #6b7280; }
</style>
