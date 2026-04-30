<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { imageUrl } from '../../services/assets'

/**
 * Card cho 1 bài lẻ (Reading Passage 1/2/3 hoặc Listening Part 1/2/3/4).
 * Click → navigate sang practice page tương ứng.
 */
const props = defineProps({
  quiz: { type: Object, required: true }, // QuizSummary từ backend
  skill: { type: String, required: true }, // 'reading' | 'listening'
})

const router = useRouter()

// Map part → màu badge (giống YouPass: mỗi passage 1 màu)
const PART_COLORS = {
  1: { bg: '#f97316', label: 'Passage 1' }, // orange
  2: { bg: '#7c3aed', label: 'Passage 2' }, // purple
  3: { bg: '#16a34a', label: 'Passage 3' }, // green
  4: { bg: '#0891b2', label: 'Passage 4' }, // cyan (chỉ listening)
}

const badge = computed(() => PART_COLORS[props.quiz.part] || { bg: '#6b7280', label: `Part ${props.quiz.part}` })

// Backend trả thumbnail là UUID → build URL qua AssetController
const thumb = computed(() => imageUrl(props.quiz.thumbnail))

function open() {
  router.push({
    name: props.skill,
    params: { quizId: props.quiz.id },
  })
}
</script>

<template>
  <article class="card" @click="open">
    <div class="card__media">
      <img v-if="thumb" :src="thumb" :alt="quiz.title" loading="lazy" />
      <div v-else class="card__media-fallback">📘</div>
      <span class="card__badge" :style="{ background: badge.bg }">
        {{ badge.label }}
      </span>
    </div>

    <div class="card__body">
      <h3 class="card__title">{{ quiz.title }}</h3>
      <div class="card__meta">
        <span v-if="quiz.book_title">{{ quiz.book_title }}</span>
        <span v-if="quiz.question_count" class="card__qc">
          · {{ quiz.question_count }} câu
        </span>
        <span v-if="quiz.time" class="card__qc">· {{ quiz.time }} phút</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  display: flex;
  flex-direction: column;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border-color: #1e40af;
}
.card__media {
  position: relative;
  aspect-ratio: 16 / 10;
  background: #f3f4f6;
  overflow: hidden;
}
.card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.card__media-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: 48px;
  color: #d1d5db;
}
.card__badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.3px;
}
.card__body {
  padding: 12px 14px 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.card__title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card__meta {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
