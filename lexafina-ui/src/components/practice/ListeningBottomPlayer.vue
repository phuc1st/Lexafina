<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

/**
 * Bottom-fixed audio player for Listening.
 * - Support single track or multi-track playlist (full test).
 * - Show a global timeline across all tracks.
 * - Keep playing when question/part UI changes.
 */
const props = defineProps({
  tracks: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits(['time-change', 'durations-change', 'track-change'])

const audioEl = ref(null)
const activeTrackIndex = ref(0)
const playing = ref(false)
const currentTime = ref(0)
const currentDuration = ref(0)
const durationByTrack = ref({})

const hasTracks = computed(() => props.tracks.length > 0)
const activeTrack = computed(() => props.tracks[activeTrackIndex.value] || null)
const activeSrc = computed(() => activeTrack.value?.src || '')

const prefixDuration = computed(() => {
  let sum = 0
  for (let i = 0; i < activeTrackIndex.value; i++) {
    sum += Number(durationByTrack.value[i] || 0)
  }
  return sum
})
const totalDuration = computed(() => {
  let sum = 0
  for (let i = 0; i < props.tracks.length; i++) {
    sum += Number(durationByTrack.value[i] || 0)
  }
  return sum
})
const globalCurrent = computed(() => prefixDuration.value + currentTime.value)
const progressPct = computed(() => {
  if (!totalDuration.value) return 0
  return (globalCurrent.value / totalDuration.value) * 100
})

async function prefetchDurations() {
  const results = {}
  await Promise.all(
    props.tracks.map((t, idx) =>
      loadDuration(t.src).then((d) => {
        results[idx] = d
      })
    )
  )
  durationByTrack.value = results
}

function loadDuration(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(0)
    const probe = new Audio()
    probe.preload = 'metadata'
    const done = (val) => {
      probe.removeEventListener('loadedmetadata', onOk)
      probe.removeEventListener('error', onErr)
      resolve(Number.isFinite(val) ? val : 0)
    }
    const onOk = () => done(probe.duration || 0)
    const onErr = () => done(0)
    probe.addEventListener('loadedmetadata', onOk)
    probe.addEventListener('error', onErr)
    probe.src = src
  })
}

function fmt(sec) {
  const s = Math.max(0, Math.floor(Number(sec) || 0))
  const hh = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = s % 60
  if (hh > 0) {
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
  }
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

function onLoadedMetadata() {
  if (!audioEl.value) return
  currentDuration.value = audioEl.value.duration || 0
}
function onTimeUpdate() {
  if (!audioEl.value) return
  currentTime.value = audioEl.value.currentTime || 0
}
function onPlay() {
  playing.value = true
}
function onPause() {
  playing.value = false
}
function onEnded() {
  if (activeTrackIndex.value < props.tracks.length - 1) {
    const wasPlaying = playing.value
    activeTrackIndex.value += 1
    emit('track-change', activeTrackIndex.value)
    currentTime.value = 0
    if (wasPlaying) {
      requestAnimationFrame(() => audioEl.value?.play())
    }
  } else {
    playing.value = false
  }
}

function togglePlay() {
  if (!audioEl.value || !hasTracks.value) return
  if (playing.value) audioEl.value.pause()
  else audioEl.value.play()
}

function seekGlobal(rawValue) {
  const value = Number(rawValue)
  if (!Number.isFinite(value) || !audioEl.value || !props.tracks.length) return

  let remain = value
  let targetTrack = 0
  for (let i = 0; i < props.tracks.length; i++) {
    const d = Number(durationByTrack.value[i] || 0)
    if (d <= 0) continue
    if (remain <= d || i === props.tracks.length - 1) {
      targetTrack = i
      break
    }
    remain -= d
  }
  const offset = Math.max(0, remain)
  const shouldContinuePlaying = playing.value

  if (targetTrack !== activeTrackIndex.value) {
    activeTrackIndex.value = targetTrack
    emit('track-change', activeTrackIndex.value)
    currentTime.value = 0
    requestAnimationFrame(() => {
      if (!audioEl.value) return
      audioEl.value.currentTime = offset
      if (shouldContinuePlaying) audioEl.value.play()
    })
  } else {
    audioEl.value.currentTime = offset
  }
}

function skip(deltaSec) {
  if (!audioEl.value) return
  const next = Math.max(0, globalCurrent.value + deltaSec)
  seekGlobal(Math.min(next, totalDuration.value || next))
}

watch(
  () => props.tracks,
  async (tracks) => {
    activeTrackIndex.value = 0
    currentTime.value = 0
    currentDuration.value = 0
    durationByTrack.value = {}
    if (!tracks?.length) return
    await prefetchDurations()
    emit('durations-change', { ...durationByTrack.value })
    emit('track-change', activeTrackIndex.value)
  },
  { immediate: true, deep: true }
)

watch(globalCurrent, (v) => {
  emit('time-change', v)
})

defineExpose({
  seekGlobal,
})

onBeforeUnmount(() => {
  if (audioEl.value) audioEl.value.pause()
})
</script>

<template>
  <div class="bottom-player" :class="{ 'bottom-player--empty': !hasTracks }">
    <div v-if="hasTracks" class="bottom-player__inner">
      <div class="meta">
        <div class="meta__title">Listening Player</div>
        <div class="meta__track">{{ activeTrack?.title || 'Audio' }}</div>
      </div>

      <div class="controls">
        <button class="ctrl" type="button" @click="skip(-5)">↺ 5</button>
        <button class="ctrl ctrl--play" type="button" @click="togglePlay">
          {{ playing ? '⏸' : '▶' }}
        </button>
        <button class="ctrl" type="button" @click="skip(5)">5 ↻</button>
      </div>

      <div class="timeline">
        <input
          class="timeline__range"
          type="range"
          min="0"
          :max="Math.max(totalDuration, 0)"
          :value="globalCurrent"
          step="0.1"
          @input="seekGlobal($event.target.value)"
        />
        <div class="timeline__bar">
          <div class="timeline__fill" :style="{ width: `${progressPct}%` }" />
        </div>
      </div>

      <div class="time">{{ fmt(globalCurrent) }} / {{ fmt(totalDuration) }}</div>

      <audio
        ref="audioEl"
        :src="activeSrc"
        preload="metadata"
        @loadedmetadata="onLoadedMetadata"
        @timeupdate="onTimeUpdate"
        @play="onPlay"
        @pause="onPause"
        @ended="onEnded"
      />
    </div>

    <div v-else class="empty">
      Không có file audio cho bài này.
    </div>
  </div>
</template>

<style scoped>
.bottom-player {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.08);
}
.bottom-player__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 10px 16px;
  display: grid;
  grid-template-columns: 260px 140px 1fr 120px;
  align-items: center;
  gap: 12px;
}
.meta__title {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}
.meta__track {
  font-size: 14px;
  color: #111827;
  font-weight: 700;
}
.controls {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ctrl {
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
  border-radius: 999px;
  height: 34px;
  min-width: 46px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.ctrl:hover { background: #f9fafb; }
.ctrl--play {
  min-width: 40px;
  font-size: 14px;
  background: #f97316;
  border-color: #f97316;
  color: #fff;
}
.ctrl--play:hover { background: #ea580c; }
.timeline {
  position: relative;
}
.timeline__range {
  width: 100%;
  opacity: 0;
  position: absolute;
  inset: 0;
  cursor: pointer;
  z-index: 2;
}
.timeline__bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}
.timeline__fill {
  height: 100%;
  background: #f97316;
}
.time {
  font-variant-numeric: tabular-nums;
  text-align: right;
  font-size: 13px;
  color: #4b5563;
  font-weight: 600;
}
.empty {
  max-width: 1280px;
  margin: 0 auto;
  padding: 12px 16px;
  font-size: 13px;
  color: #6b7280;
}

@media (max-width: 900px) {
  .bottom-player__inner {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .time { text-align: left; }
}
</style>

