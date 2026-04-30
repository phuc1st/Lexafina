<script setup>
import { onMounted, watch, ref, onBeforeUnmount } from 'vue'

/**
 * Render content có placeholder `<span class="gap-placeholder" data-question-id="gf_7">`
 * thành các <input> inline đặt đúng vị trí trong text.
 *
 * Approach: parse HTML 1 lần qua DOMParser → replace placeholder → mount vào container.
 *   Sau đó chỉ sync `value` qua DOM API khi `answers` đổi từ ngoài (vd reset, ResultPage)
 *   để không phá caret position của user khi đang gõ.
 *
 * Mapping: placeholder `data-question-id="gf_7"` → question có `order = 7`.
 *   Quy tắc: phần số nằm sau dấu '_' cuối cùng.
 *
 * Review mode:
 *   - Input readonly (để vẫn click được)
 *   - Tô màu xanh/đỏ theo đúng/sai
 *   - Click vào input → emit select-question để mở giải thích
 *   - Ô input hiển thị luôn đáp án đúng
 */
const props = defineProps({
  questionSet: { type: Object, required: true },
  answers: { type: Object, required: true },
  flatQuestions: { type: Array, required: true }, // eslint-disable-line vue/no-unused-properties
  disabled: { type: Boolean, default: false },
  reviewMode: { type: Boolean, default: false },
  resultDetails: { type: Object, default: () => ({}) },
  selectedQuestionId: { type: Number, default: null },
})

const emit = defineEmits(['update:answer', 'select-question'])

const containerRef = ref(null)
// Map<questionId, HTMLInputElement> — để sync value khi answers thay đổi từ ngoài
const inputs = new Map()
const cleanupFns = []

function extractOrder(placeholderId) {
  if (!placeholderId) return null
  const parts = String(placeholderId).split('_')
  const last = parts[parts.length - 1]
  const n = Number(last)
  return Number.isFinite(n) ? n : null
}

function findQuestionByOrder(order) {
  return (props.questionSet.questions || []).find((q) => Number(q.order) === order)
}

function normalize(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function isAnswerCorrect(question, value) {
  if (!question || !value) return false
  const expected = question.correct_answer
  if (Array.isArray(question.correct_answers) && question.correct_answers.length) {
    return question.correct_answers.some((c) => normalize(c) === normalize(value))
  }
  if (expected) {
    // Cho phép alternates "A/B" trong correct_answer
    const alts = String(expected).split('/').map(normalize)
    return alts.includes(normalize(value))
  }
  return false
}

function getCorrectAnswer(question) {
  if (!question) return ''
  if (question.correct_answer) return String(question.correct_answer)
  if (Array.isArray(question.correct_answers) && question.correct_answers.length) {
    return question.correct_answers.join(' / ')
  }
  return ''
}

function buildDom() {
  if (!containerRef.value) return
  cleanup()

  const html = props.questionSet.content || ''
  const doc = new DOMParser().parseFromString(html, 'text/html')

  const placeholders = doc.querySelectorAll('.gap-placeholder')
  placeholders.forEach((span) => {
    const order = extractOrder(span.dataset.questionId)
    const question = order != null ? findQuestionByOrder(order) : null

    if (!question) {
      span.textContent = '____'
      span.classList.add('gap-orphan')
      return
    }

    const input = doc.createElement('input')
    input.type = 'text'
    input.className = 'gap-input'
    input.dataset.questionId = String(question.id)
    input.dataset.order = String(question.order ?? '')
    input.placeholder = '____'
    input.autocomplete = 'off'
    input.autocapitalize = 'none'
    input.spellcheck = false
    if (props.reviewMode) {
      input.readOnly = true
      input.value = getCorrectAnswer(question) || props.answers[question.id] || ''
    } else {
      if (props.disabled) input.disabled = true
      input.value = props.answers[question.id] ?? ''
    }

    const wrapper = doc.createElement('span')
    wrapper.className = 'gap-wrap'
    const orderEl = doc.createElement('span')
    orderEl.className = 'gap-order'
    orderEl.textContent = `${question.order}. `
    wrapper.appendChild(orderEl)
    wrapper.appendChild(input)

    span.replaceWith(wrapper)
  })

  containerRef.value.innerHTML = ''
  Array.from(doc.body.childNodes).forEach((n) => {
    containerRef.value.appendChild(n)
  })

  // Cache + bind events
  inputs.clear()
  containerRef.value.querySelectorAll('.gap-input').forEach((input) => {
    const qid = Number(input.dataset.questionId)
    inputs.set(qid, input)

    if (props.reviewMode) {
      const handler = () => emit('select-question', qid)
      input.addEventListener('click', handler)
      cleanupFns.push(() => input.removeEventListener('click', handler))
    } else {
      const handler = (e) => {
        emit('update:answer', { questionId: qid, value: e.target.value })
      }
      input.addEventListener('input', handler)
      cleanupFns.push(() => input.removeEventListener('input', handler))
    }
  })

  refreshReviewState()
}

function refreshReviewState() {
  if (!containerRef.value) return
  inputs.forEach((input, qid) => {
    input.classList.remove('gap-input--correct', 'gap-input--wrong', 'gap-input--blank', 'gap-input--selected')
    if (!props.reviewMode) return
    const value = props.answers[qid] ?? ''
    const question = (props.questionSet.questions || []).find((q) => q.id === qid)
    input.value = getCorrectAnswer(question) || value
    if (!value) input.classList.add('gap-input--blank')
    else if (isAnswerCorrect(question, value)) input.classList.add('gap-input--correct')
    else input.classList.add('gap-input--wrong')
    if (props.selectedQuestionId === qid) input.classList.add('gap-input--selected')
  })
}

function cleanup() {
  while (cleanupFns.length) cleanupFns.pop()()
  inputs.clear()
}

watch(
  () => props.answers,
  (next) => {
    inputs.forEach((input, qid) => {
      const v = next[qid] ?? ''
      if (!props.reviewMode && input.value !== v) input.value = v
    })
    refreshReviewState()
  },
  { deep: true }
)

watch(() => props.selectedQuestionId, refreshReviewState)
watch(() => props.questionSet?.id, buildDom)
watch(() => props.questionSet?.content, buildDom)
watch(() => props.disabled, buildDom)
watch(() => props.reviewMode, buildDom)

onMounted(buildDom)
onBeforeUnmount(cleanup)
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
    </header>

    <div ref="containerRef" class="qset__inline" />
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
.qset__desc { font-size: 14px; line-height: 1.5; color: #374151; }
.qset__desc :deep(strong) { color: #111827; }

.qset__inline {
  font-size: 15px;
  line-height: 1.85;
  color: #1f2937;
}
.qset__inline :deep(p) { margin: 0 0 10px; }
.qset__inline :deep(h3),
.qset__inline :deep(h4) { margin: 16px 0 8px; color: #111827; }
.qset__inline :deep(ul), .qset__inline :deep(ol) {
  margin: 8px 0 12px;
  padding-left: 24px;
}
.qset__inline :deep(li) { margin-bottom: 6px; }

.qset__inline :deep(.gap-wrap) {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  vertical-align: baseline;
}
.qset__inline :deep(.gap-order) {
  font-weight: 700;
  color: #2563eb;
  font-size: 13px;
}
.qset__inline :deep(.gap-input) {
  display: inline-block;
  min-width: 110px;
  width: 130px;
  padding: 2px 8px;
  border: 0;
  border-bottom: 2px solid #2563eb;
  background: #fef3c7;
  font-size: 14px;
  font-family: inherit;
  color: #92400e;
  font-weight: 600;
  outline: none;
  border-radius: 3px;
}
.qset__inline :deep(.gap-input:focus) {
  background: #fde68a;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25);
}
.qset__inline :deep(.gap-input:read-only) {
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
}
.qset__inline :deep(.gap-input--correct:read-only) {
  background: #dcfce7;
  color: #15803d;
  border-bottom-color: #16a34a;
}
.qset__inline :deep(.gap-input--wrong:read-only) {
  background: #fee2e2;
  color: #b91c1c;
  border-bottom-color: #dc2626;
}
.qset__inline :deep(.gap-input--blank:read-only) {
  background: #f3f4f6;
  color: #9ca3af;
  border-bottom-color: #9ca3af;
}
.qset__inline :deep(.gap-input--selected) {
  box-shadow: 0 0 0 2px #f97316;
}
.qset__inline :deep(.gap-orphan) {
  color: #9ca3af;
  font-style: italic;
}
</style>
