<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { questionTypeLabel } from '../services/questionTypeLabels'

const router = useRouter()

const result = ref(null)
const quiz = ref(null)

onMounted(() => {
  const r = sessionStorage.getItem('lexafina:lastResult')
  const q = sessionStorage.getItem('lexafina:lastQuiz')
  if (r) result.value = JSON.parse(r)
  if (q) quiz.value = JSON.parse(q)
})

const correctCount = computed(() => result.value?.correct_count || 0)
const total = computed(() => result.value?.total_questions || 0)
const wrongCount = computed(() =>
  (result.value?.details || []).filter((d) => !d.is_correct && d.user_answer).length
)
const blankCount = computed(() =>
  (result.value?.details || []).filter((d) => !d.user_answer).length
)
const score = computed(() => result.value?.score ?? 0)

const usedTimeFormatted = computed(() => {
  const s = result.value?.used_seconds || 0
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
})

// Quy đổi band IELTS đơn giản theo tỉ lệ đúng (chỉ minh hoạ).
const band = computed(() => {
  if (!total.value) return '0.0'
  const ratio = correctCount.value / total.value
  if (ratio >= 0.975) return '9.0'
  if (ratio >= 0.925) return '8.5'
  if (ratio >= 0.875) return '8.0'
  if (ratio >= 0.825) return '7.5'
  if (ratio >= 0.75) return '7.0'
  if (ratio >= 0.65) return '6.5'
  if (ratio >= 0.575) return '6.0'
  if (ratio >= 0.5) return '5.5'
  if (ratio >= 0.4) return '5.0'
  if (ratio >= 0.3) return '4.5'
  if (ratio >= 0.2) return '4.0'
  if (ratio > 0) return '3.5'
  return '0.0'
})

// Vòng tròn progress: stroke-dasharray theo tỉ lệ đúng
const progressDash = computed(() => {
  const r = total.value ? correctCount.value / total.value : 0
  const circumference = 2 * Math.PI * 70 // r=70
  const filled = circumference * r
  return `${filled} ${circumference - filled}`
})

// Group details theo question_set (chốt 4.A) — quiz đã có cấu trúc parts/qs
const breakdown = computed(() => {
  if (!quiz.value || !result.value) return []

  // Build map questionId -> detail
  const detailMap = new Map()
  for (const d of result.value.details || []) {
    detailMap.set(d.question_id, d)
  }

  const rows = []
  for (const part of quiz.value.parts || []) {
    for (const qs of part.question_sets || []) {
      let correct = 0
      let wrong = 0
      let blank = 0
      const qsQuestions = qs.questions || []
      for (const q of qsQuestions) {
        const d = detailMap.get(q.id)
        if (!d) {
          blank++
          continue
        }
        if (d.is_correct) correct++
        else if (d.user_answer) wrong++
        else blank++
      }
      rows.push({
        id: qs.id,
        title: qs.title || 'Questions',
        type: questionTypeLabel(qs.question_type),
        count: qsQuestions.length,
        correct,
        wrong,
        blank,
      })
    }
  }
  return rows
})

const skill = computed(() => result.value?.skill || 'reading')
const quizId = computed(() => result.value?.quiz_id || quiz.value?.id)

function backHome() {
  router.push({ name: 'practice-list', params: { skill: skill.value } })
}

function viewDetails() {
  if (!quizId.value) return
  router.push({
    name: skill.value,
    params: { quizId: quizId.value },
    query: { mode: 'review' },
  })
}
</script>

<template>
  <div v-if="!result" class="state">
    <p>Không có kết quả để hiển thị.</p>
    <button class="btn btn--primary" @click="backHome">Về trang chủ</button>
  </div>

  <div v-else class="page">
    <header class="topbar">
      <button class="topbar__close" aria-label="Đóng" @click="backHome">×</button>
      <h1 class="topbar__title">{{ quiz?.title || 'Kết quả' }}</h1>
    </header>

    <main class="main">
      <!-- Hàng trên: 2 cột -->
      <section class="row row--top">
        <!-- Left col: motivational + band -->
        <div class="col col--left">
          <div class="mascot">
            <div class="mascot__img">🦊</div>
            <p class="mascot__text">
              Đề IELTS hơi khó bạn nhỉ, mình cố tiếp cùng nhau nha,
              từ từ sẽ giỏi thôi!
            </p>
          </div>

          <div class="band">
            <div class="band__label">Band Score:</div>
            <div class="band__value">{{ band }}</div>
          </div>
        </div>

        <!-- Right col: score circle -->
        <div class="col col--right">
          <div class="score-card">
            <div class="score-card__head">
              <h3>Kết quả làm bài</h3>
              <div class="score-card__time">
                Thời gian làm bài
                <strong>{{ usedTimeFormatted }}</strong>
              </div>
            </div>

            <div class="score-card__body">
              <div class="circle">
                <svg viewBox="0 0 160 160" class="circle__svg">
                  <circle cx="80" cy="80" r="70" class="circle__bg" />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    class="circle__fg"
                    :stroke-dasharray="progressDash"
                  />
                </svg>
                <div class="circle__center">
                  <div class="circle__num">{{ correctCount }}/{{ total }}</div>
                  <div class="circle__label">câu đúng</div>
                </div>
              </div>

              <ul class="legend">
                <li class="legend__item legend__item--correct">
                  <span class="dot" /> Đúng
                  <strong>{{ correctCount }}</strong> câu
                </li>
                <li class="legend__item legend__item--wrong">
                  <span class="dot" /> Sai
                  <strong>{{ wrongCount }}</strong> câu
                </li>
                <li class="legend__item legend__item--blank">
                  <span class="dot" /> Bỏ qua
                  <strong>{{ blankCount }}</strong> câu
                </li>
              </ul>
            </div>

            <button class="btn-detail" @click="viewDetails">
              Xem giải thích chi tiết
            </button>
          </div>
        </div>
      </section>

      <!-- Bảng dữ liệu chi tiết -->
      <section class="breakdown">
        <h2 class="breakdown__title">Bảng dữ liệu chi tiết</h2>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th class="t-left">Loại câu hỏi</th>
                <th>Số câu hỏi</th>
                <th class="th--correct">Đúng</th>
                <th class="th--wrong">Sai</th>
                <th class="th--blank">Bỏ qua</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in breakdown" :key="row.id">
                <td class="t-left">
                  <div class="qtype">{{ row.type }}</div>
                  <div class="qtype__sub">{{ row.title }}</div>
                </td>
                <td>{{ row.count }}</td>
                <td>
                  <span class="pill pill--correct">{{ row.correct }}</span>
                </td>
                <td>
                  <span class="pill pill--wrong">{{ row.wrong }}</span>
                </td>
                <td>
                  <span class="pill pill--blank">{{ row.blank }}</span>
                </td>
              </tr>
              <tr v-if="!breakdown.length" class="empty">
                <td colspan="5">Không có dữ liệu.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p class="footer-note">Bài này có giúp bạn nâng cấp Pro để tiếp tục luyện thi không?</p>
    </main>
  </div>
</template>

<style scoped>
.state {
  min-height: 100vh;
  display: grid;
  place-items: center;
  gap: 16px;
  color: #6b7280;
}

.page {
  min-height: 100vh;
  background: #fff7ed;
}
.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}
.topbar__close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #d1d5db;
  background: #fff;
  font-size: 18px;
  cursor: pointer;
  color: #6b7280;
}
.topbar__close:hover { border-color: #f97316; color: #f97316; }
.topbar__title {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.main {
  max-width: 1080px;
  margin: 0 auto;
  padding: 28px 20px 60px;
}

/* Hàng trên */
.row--top {
  display: grid;
  grid-template-columns: 1fr 1.05fr;
  gap: 20px;
  margin-bottom: 28px;
}
.col { display: flex; flex-direction: column; gap: 16px; }

/* Mascot */
.mascot {
  background: #fff;
  border-radius: 16px;
  padding: 18px 22px;
  display: flex;
  gap: 14px;
  align-items: center;
  border: 1px solid #fde68a;
}
.mascot__img {
  font-size: 56px;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 6px rgba(249, 115, 22, 0.25));
}
.mascot__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: #92400e;
  font-weight: 600;
}

/* Band card */
.band {
  background: linear-gradient(180deg, #fb923c 0%, #f97316 100%);
  color: #fff;
  border-radius: 16px;
  padding: 28px 24px;
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 180px;
  box-shadow: 0 6px 18px rgba(249, 115, 22, 0.25);
}
.band__label {
  font-size: 18px;
  font-weight: 700;
}
.band__value {
  font-size: 56px;
  font-weight: 800;
  line-height: 1;
  margin-top: 6px;
  font-variant-numeric: tabular-nums;
}

/* Score card */
.score-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid #fde68a;
}
.score-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.score-card__head h3 {
  margin: 0;
  font-size: 15px;
  color: #111827;
  font-weight: 700;
}
.score-card__time {
  font-size: 12px;
  color: #6b7280;
  text-align: right;
}
.score-card__time strong {
  display: block;
  font-size: 14px;
  color: #1f2937;
  margin-top: 2px;
  font-variant-numeric: tabular-nums;
}

.score-card__body {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 4px 0;
}

/* Circle */
.circle {
  position: relative;
  width: 160px;
  height: 160px;
  flex-shrink: 0;
}
.circle__svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.circle__bg {
  fill: none;
  stroke: #f3f4f6;
  stroke-width: 14;
}
.circle__fg {
  fill: none;
  stroke: #f97316;
  stroke-width: 14;
  stroke-linecap: round;
  transition: stroke-dasharray 0.4s ease;
}
.circle__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.circle__num {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  font-variant-numeric: tabular-nums;
}
.circle__label {
  font-size: 13px;
  color: #6b7280;
}

/* Legend */
.legend { list-style: none; padding: 0; margin: 0; flex: 1; }
.legend__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 14px;
  color: #4b5563;
}
.legend__item strong {
  margin-left: auto;
  color: #111827;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.legend__item--correct .dot { background: #16a34a; }
.legend__item--wrong .dot { background: #dc2626; }
.legend__item--blank .dot { background: #9ca3af; }

.btn-detail {
  align-self: center;
  padding: 10px 28px;
  background: #f97316;
  color: #fff;
  border: 0;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-detail:hover { background: #ea580c; }

/* Breakdown */
.breakdown {
  background: #fff;
  border-radius: 16px;
  padding: 22px 24px;
  border: 1px solid #e5e7eb;
}
.breakdown__title {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}
.table-wrap { overflow-x: auto; }
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.table th,
.table td {
  padding: 12px 14px;
  text-align: center;
  border-bottom: 1px solid #f3f4f6;
}
.table th {
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #f9fafb;
}
.t-left { text-align: left !important; }
.th--correct { color: #15803d !important; background: #dcfce7 !important; }
.th--wrong { color: #b91c1c !important; background: #fee2e2 !important; }
.th--blank { color: #4b5563 !important; background: #f3f4f6 !important; }

.qtype {
  font-weight: 700;
  color: #111827;
}
.qtype__sub {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13px;
}
.pill--correct { background: #dcfce7; color: #15803d; }
.pill--wrong { background: #fee2e2; color: #b91c1c; }
.pill--blank { background: #f3f4f6; color: #4b5563; }

.empty { color: #9ca3af; font-style: italic; }
.empty td { padding: 24px; text-align: center; }

.footer-note {
  margin-top: 18px;
  text-align: center;
  font-size: 13px;
  color: #6b7280;
  font-style: italic;
}

.btn {
  padding: 9px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: 0;
  cursor: pointer;
}
.btn--primary { background: #f97316; color: #fff; }
.btn--primary:hover { background: #ea580c; }

@media (max-width: 880px) {
  .row--top { grid-template-columns: 1fr; }
  .score-card__body { flex-direction: column; }
}
</style>
