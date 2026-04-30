<script setup>
import QuestionItem from './QuestionItem.vue'

/**
 * Render question_set kiểu chuẩn: mỗi câu là 1 QuestionItem độc lập.
 * Dùng cho: TRUE/FALSE/NOT GIVEN, YES/NO/NOT GIVEN, MULTIPLE_CHOICE_ONE/MANY...
 */
const props = defineProps({
  questionSet: { type: Object, required: true },
  answers: { type: Object, required: true },
  flatQuestions: { type: Array, required: true },
  disabled: { type: Boolean, default: false },
  reviewMode: { type: Boolean, default: false },
  resultDetails: { type: Object, default: () => ({}) },
  selectedQuestionId: { type: Number, default: null },
})

const emit = defineEmits(['update:answer', 'select-question'])

function getFlat(qid) {
  return props.flatQuestions.find((q) => q.id === qid)
}
function detailOf(qid) {
  return props.resultDetails?.[qid] || null
}
</script>

<template>
  <section class="qset" :id="`qs-${questionSet.id}`">
    <header class="qset__head">
      <h3 class="qset__title">{{ questionSet.title || 'Questions' }}</h3>
      <div
        v-if="questionSet.description"
        class="qset__desc"
        v-html="questionSet.description"
      />
      <div
        v-if="questionSet.content"
        class="qset__content"
        v-html="questionSet.content"
      />
    </header>

    <div class="qset__items">
      <QuestionItem
        v-for="q in questionSet.questions || []"
        :key="q.id"
        :id="`q-${q.id}`"
        :question="getFlat(q.id) || q"
        :model-value="answers[q.id] || ''"
        :disabled="disabled"
        :review-mode="reviewMode"
        :result-detail="detailOf(q.id)"
        :selected="selectedQuestionId === q.id"
        @update:model-value="(v) => emit('update:answer', { questionId: q.id, value: v })"
        @select="emit('select-question', q.id)"
      />
    </div>
  </section>
</template>

<style scoped>
.qset { display: flex; flex-direction: column; gap: 16px; }
.qset__head {
  border-left: 4px solid #2563eb;
  padding: 4px 12px;
  background: #f8fafc;
  border-radius: 0 8px 8px 0;
}
.qset__title {
  margin: 0 0 6px;
  font-size: 16px;
  color: #1e40af;
  font-weight: 700;
}
.qset__desc, .qset__content {
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
}
.qset__desc :deep(strong) { color: #111827; }
.qset__items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
