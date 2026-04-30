<script setup>
import QuestionSetRenderer from './QuestionSetRenderer.vue'

/**
 * Render toàn bộ question_sets của 1 part bằng cách delegate sang
 * QuestionSetRenderer (router theo loại question_set).
 *
 * Props:
 *  - part: object có question_sets
 *  - answers: Map<questionId, string>
 *  - flatQuestions: array đã được phẳng hoá để các renderer truy cập globalIndex
 *  - disabled: boolean (true ở review mode hoặc khi đã submit)
 *  - reviewMode: boolean — bật hiển thị correct answer + đúng/sai
 *  - resultDetails: Map<questionId, { is_correct, user_answer }>
 *  - selectedQuestionId: number | null — để highlight câu đang xem giải thích
 *
 * Emit:
 *  - update:answer ({ questionId, value })
 *  - select-question (questionId)
 */
defineProps({
  part: { type: Object, required: true },
  answers: { type: Object, required: true },
  flatQuestions: { type: Array, required: true },
  disabled: { type: Boolean, default: false },
  reviewMode: { type: Boolean, default: false },
  resultDetails: { type: Object, default: () => ({}) },
  selectedQuestionId: { type: Number, default: null },
})
const emit = defineEmits(['update:answer', 'select-question'])
</script>

<template>
  <div class="qlist">
    <QuestionSetRenderer
      v-for="qs in part.question_sets || []"
      :key="qs.id"
      :question-set="qs"
      :answers="answers"
      :flat-questions="flatQuestions"
      :disabled="disabled"
      :review-mode="reviewMode"
      :result-details="resultDetails"
      :selected-question-id="selectedQuestionId"
      @update:answer="(p) => emit('update:answer', p)"
      @select-question="(qid) => emit('select-question', qid)"
    />
  </div>
</template>

<style scoped>
.qlist {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
</style>
