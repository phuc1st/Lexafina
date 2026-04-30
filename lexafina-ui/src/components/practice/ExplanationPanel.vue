<script setup>
import { computed } from 'vue'
import { extractLocateRanges } from '../../services/locateInfo'

/**
 * Panel cố định cuối cột phải trong review mode — đổi nội dung theo
 * `selectedQuestion`.
 *
 * Hiển thị:
 *  - Số câu, đáp án đúng/đáp án người dùng
 *  - HTML giải thích (question.explain)
 *  - Action: Định vị câu trong passage (emit "locate")
 */
const props = defineProps({
  question: { type: Object, default: null },
  userAnswer: { type: String, default: '' },
  isCorrect: { type: Boolean, default: false },
})

const emit = defineEmits(['locate', 'close'])

const correctText = computed(() => {
  if (!props.question) return ''
  if (props.question.correct_answer) return props.question.correct_answer
  if (Array.isArray(props.question.correct_answers)) {
    return props.question.correct_answers.join(', ')
  }
  return ''
})

const hasLocate = computed(() => {
  const ranges = extractLocateRanges(props.question?.locate_info)
  return Array.isArray(ranges) && ranges.length > 0
})
</script>

<template>
  <aside v-if="question" class="exp">
    <header class="exp__head">
      <div class="exp__head-left">
        <span class="exp__num">Câu {{ question.displayOrderLabel || question.order || question.globalIndex }}</span>
        <span
          class="exp__badge"
          :class="isCorrect ? 'exp__badge--correct' : userAnswer ? 'exp__badge--wrong' : 'exp__badge--blank'"
        >
          {{ isCorrect ? '✓ Đúng' : userAnswer ? '✗ Sai' : '— Chưa làm' }}
        </span>
      </div>
      <div class="exp__head-right">
        <button
          v-if="hasLocate"
          type="button"
          class="exp__btn"
          @click="emit('locate', question)"
        >
          Định vị trong bài
        </button>
        <button
          type="button"
          class="exp__close"
          aria-label="Đóng"
          @click="emit('close')"
        >×</button>
      </div>
    </header>

    <div class="exp__answers">
      <div class="exp__row">
        <span class="exp__label">Đáp án của bạn</span>
        <span class="exp__val exp__val--user" :class="{ 'exp__val--wrong': !isCorrect && userAnswer }">
          {{ userAnswer || '—' }}
        </span>
      </div>
      <div class="exp__row">
        <span class="exp__label">Đáp án đúng</span>
        <span class="exp__val exp__val--correct">{{ correctText || '—' }}</span>
      </div>
    </div>

    <div v-if="question.explain" class="exp__body" v-html="question.explain" />
    <div v-else class="exp__empty">Câu này chưa có giải thích.</div>
  </aside>
</template>

<style scoped>
.exp {
  background: #fff;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
}
.exp__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.exp__head-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.exp__num {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
}
.exp__badge {
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
}
.exp__badge--correct { background: #dcfce7; color: #15803d; }
.exp__badge--wrong   { background: #fee2e2; color: #b91c1c; }
.exp__badge--blank   { background: #f3f4f6; color: #4b5563; }

.exp__head-right { display: flex; align-items: center; gap: 6px; }
.exp__btn {
  padding: 5px 12px;
  font-size: 12.5px;
  font-weight: 600;
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fdba74;
  border-radius: 999px;
  cursor: pointer;
}
.exp__btn:hover { background: #ffedd5; }
.exp__close {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}
.exp__close:hover { color: #b91c1c; border-color: #fca5a5; }

.exp__answers {
  display: flex;
  gap: 18px;
  font-size: 13px;
  flex-wrap: wrap;
  padding: 6px 0;
  border-top: 1px dashed #fde68a;
  border-bottom: 1px dashed #fde68a;
}
.exp__row { display: flex; align-items: center; gap: 6px; }
.exp__label {
  color: #6b7280;
  font-size: 12px;
}
.exp__val {
  font-weight: 700;
  font-size: 13px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #f9fafb;
  color: #1f2937;
}
.exp__val--correct { background: #dcfce7; color: #15803d; }
.exp__val--wrong { background: #fee2e2; color: #b91c1c; }

.exp__body {
  font-size: 13.5px;
  line-height: 1.6;
  color: #374151;
}
.exp__body :deep(strong) { color: #111827; }
.exp__body :deep(ul) { padding-left: 20px; margin: 6px 0; }
.exp__body :deep(li) { margin-bottom: 4px; }
.exp__body :deep(.ace-line) { margin-bottom: 4px; }

.exp__empty {
  font-size: 13px;
  color: #9ca3af;
  font-style: italic;
}
</style>
