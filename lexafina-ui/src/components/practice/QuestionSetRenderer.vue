<script setup>
import { computed } from 'vue'
import StandardQuestionSet from './StandardQuestionSet.vue'
import InlineGapQuestionSet from './InlineGapQuestionSet.vue'
import InlineOptionAssignQuestionSet from './InlineOptionAssignQuestionSet.vue'

/**
 * Quyết định renderer dựa trên content + options:
 * - Có `.gap-placeholder` + có options[] -> InlineOptionAssign (click-select bank)
 * - Có `.gap-placeholder` + không options -> InlineGap (text input)
 * - Không placeholder -> StandardQuestionSet
 *
 * Rule này bao phủ cả NOTE/SUMMARY completion có phrase bank (A-H),
 * không chỉ MATCHING_*.
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

const HAS_PLACEHOLDER = /class="gap-placeholder"/

const renderer = computed(() => {
  const html = props.questionSet.content || ''
  const hasPlaceholder = HAS_PLACEHOLDER.test(html)
  const hasOptions =
    Array.isArray(props.questionSet.options) && props.questionSet.options.length > 0

  if (hasPlaceholder) {
    return hasOptions ? InlineOptionAssignQuestionSet : InlineGapQuestionSet
  }
  return StandardQuestionSet
})

function bubbleAnswer(payload) {
  emit('update:answer', payload)
}
function bubbleSelect(qid) {
  emit('select-question', qid)
}
</script>

<template>
  <component
    :is="renderer"
    :question-set="questionSet"
    :answers="answers"
    :flat-questions="flatQuestions"
    :disabled="disabled"
    :review-mode="reviewMode"
    :result-details="resultDetails"
    :selected-question-id="selectedQuestionId"
    @update:answer="bubbleAnswer"
    @select-question="bubbleSelect"
  />
</template>
