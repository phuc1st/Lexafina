<script setup>
import { computed } from 'vue'

/**
 * Lưới số câu (1..N), highlight câu đã trả lời, click → emit jump.
 *
 * Props:
 *  - flatQuestions: [{ id, globalIndex, partId, ... }]
 *  - answers: object map<id, string>
 *  - parts: [{ id, title }] – để group theo part
 *  - reviewMode: boolean — màu theo đúng/sai
 *  - resultDetails: map<id, { is_correct }>
 *  - selectedQuestionId: number | null — đánh dấu câu đang xem
 *
 * Emit: jump (questionId)
 */
const props = defineProps({
  flatQuestions: { type: Array, required: true },
  answers: { type: Object, required: true },
  parts: { type: Array, default: () => [] },
  reviewMode: { type: Boolean, default: false },
  resultDetails: { type: Object, default: () => ({}) },
  selectedQuestionId: { type: Number, default: null },
})
const emit = defineEmits(['jump'])

const groupedByPart = computed(() => {
  const map = new Map()
  for (const q of props.flatQuestions) {
    if (!map.has(q.partId)) map.set(q.partId, [])
    map.get(q.partId).push(q)
  }
  return [...map.entries()].map(([partId, questions]) => ({
    partId,
    title: props.parts.find((p) => p.id === partId)?.title || `Part`,
    questions,
  }))
})

const isAnswered = (qid) => {
  const v = props.answers[qid]
  return v !== undefined && v !== null && v !== ''
}

function cellClass(qid) {
  const cls = []
  if (props.reviewMode) {
    const detail = props.resultDetails?.[qid]
    if (!isAnswered(qid)) cls.push('cell--blank')
    else if (detail?.is_correct) cls.push('cell--correct')
    else cls.push('cell--wrong')
  } else if (isAnswered(qid)) {
    cls.push('cell--done')
  }
  if (props.selectedQuestionId === qid) cls.push('cell--selected')
  return cls
}
</script>

<template>
  <aside class="sheet">
    <div class="sheet__head">
      <h4>{{ reviewMode ? 'Bảng kết quả' : 'Answer sheet' }}</h4>
      <span class="sheet__count">
        {{ Object.keys(answers).filter((k) => isAnswered(k)).length }}
        / {{ flatQuestions.length }}
      </span>
    </div>

    <div v-for="g in groupedByPart" :key="g.partId" class="sheet__group">
      <div class="sheet__group-title">{{ g.title }}</div>
      <div class="sheet__grid">
        <button
          v-for="q in g.questions"
          :key="q.id"
          class="cell"
          :class="cellClass(q.id)"
          @click="emit('jump', q.id)"
          :title="`Question ${q.displayOrderLabel || q.order || q.globalIndex}`"
        >
          {{ q.displayOrderLabel || q.order || q.globalIndex }}
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sheet {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: 16px;
}
.sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sheet__head h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}
.sheet__count {
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
}
.sheet__group { display: flex; flex-direction: column; gap: 6px; }
.sheet__group-title {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.sheet__grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}
.cell {
  aspect-ratio: 1;
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 600;
  white-space: nowrap;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
}
.cell:hover { background: #f3f4f6; }
.cell--done {
  background: #2563eb;
  color: #fff;
  border-color: #1e40af;
}
.cell--done:hover { background: #1e40af; }
.cell--correct {
  background: #16a34a;
  color: #fff;
  border-color: #15803d;
}
.cell--correct:hover { background: #15803d; }
.cell--wrong {
  background: #dc2626;
  color: #fff;
  border-color: #b91c1c;
}
.cell--wrong:hover { background: #b91c1c; }
.cell--blank {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #d1d5db;
}
.cell--selected {
  outline: 2px solid #f97316;
  outline-offset: 1px;
}
</style>
