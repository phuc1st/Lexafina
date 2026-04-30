<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { imageUrl } from '../../services/assets'
import { api } from '../../services/api'

/**
 * Card cho 1 mock test (1 đề full). Click "Làm bài" → fetch chi tiết
 * mock-test để lấy id của quiz "full" rồi navigate sang practice page.
 *
 * Lý do fetch on-demand: response của /api/mock-tests (BookGroup) không
 * kèm full_quiz_id để giữ payload nhẹ. Chấp nhận thêm 1 round-trip khi click.
 */
const props = defineProps({
  mockTest: { type: Object, required: true }, // MockTestSummary
  skill: { type: String, required: true },
})

const router = useRouter()
const loading = ref(false)
const errMsg = ref('')

const thumb = computed(() => imageUrl(props.mockTest.thumbnail))

async function open() {
  if (loading.value) return
  loading.value = true
  errMsg.value = ''
  try {
    const detail = await api.getMockTest(props.mockTest.id)
    const fullId = detail?.quizzes?.full?.id
    if (!fullId) {
      errMsg.value = 'Đề này chưa có quiz full.'
      return
    }
    router.push({
      name: props.skill,
      params: { quizId: fullId },
    })
  } catch (e) {
    errMsg.value = e.message || 'Không tải được đề.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <article class="card">
    <div class="card__media">
      <img v-if="thumb" :src="thumb" :alt="mockTest.title" loading="lazy" />
      <div v-else class="card__media-fallback">📚</div>
      <span class="card__badge">Orange test</span>
    </div>

    <div class="card__body">
      <h3 class="card__title">{{ mockTest.title }}</h3>

      <!-- Progress placeholder: hiện không có user progress thật → vòng tròn rỗng -->
      <div class="card__progress" aria-label="Trạng thái hoàn thành">
        <span class="circle" />
      </div>

      <button
        class="card__btn"
        :disabled="loading"
        @click="open"
      >
        {{ loading ? 'Đang mở...' : 'Làm bài' }}
      </button>
      <p v-if="errMsg" class="card__err">{{ errMsg }}</p>
    </div>
  </article>
</template>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border-color: #16a34a;
}
.card__media {
  position: relative;
  aspect-ratio: 4 / 3;
  background: linear-gradient(180deg, #d1fae5 0%, #6ee7b7 100%);
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
}
.card__badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 3px 8px;
  border-radius: 4px;
  background: #16a34a;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}
.card__body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  text-align: center;
}
.card__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}
.card__progress {
  display: flex;
  justify-content: center;
}
.circle {
  display: inline-block;
  width: 22px;
  height: 22px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
}
.card__btn {
  width: 100%;
  padding: 9px 14px;
  background: #f97316;
  color: #fff;
  border: 0;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.card__btn:hover:not(:disabled) { background: #ea580c; }
.card__btn:disabled { opacity: 0.6; cursor: progress; }
.card__err { margin: 0; font-size: 12px; color: #b91c1c; }
</style>
