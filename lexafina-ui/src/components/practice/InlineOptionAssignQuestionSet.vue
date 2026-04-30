<script setup>
import { onMounted, watch, ref, onBeforeUnmount, computed } from 'vue'

/**
 * Render content có placeholder thành các "slot" có thể click để gán 1 option
 * từ option bank phía dưới. Dùng cho MATCHING_FEATURES / MATCHING_ENDINGS.
 *
 * Cơ chế (live mode):
 *   1. Render content qua DOM, replace mỗi `.gap-placeholder` thành <button class="gap-slot">
 *   2. Click slot → activate. Slot active có viền + nền nổi bật.
 *   3. Click 1 option chip → emit answer cho slot active.
 *      - Nếu allow_reuse=false: option đã dùng cho câu khác sẽ disable.
 *   4. Click slot active lần nữa → deactivate.
 *
 * Review mode:
 *   - Disable activate
 *   - Slot tô màu xanh/đỏ theo đúng/sai
 *   - Click slot → emit select-question để mở giải thích
 *   - Option bank được ẩn
 *
 * Dữ liệu lưu giống standard: answers[questionId] = "B"  (chữ cái option).
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
const activeQuestionId = ref(null)

// Map<questionId, { slot: HTMLElement, question: Object }>
const slots = new Map()
const cleanupFns = []

const allowReuse = computed(() => Boolean(props.questionSet.allow_reuse))
const options = computed(() => props.questionSet.options || [])

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

function buildDom() {
  if (!containerRef.value) return
  cleanup()

  const html = props.questionSet.content || ''
  const doc = new DOMParser().parseFromString(html, 'text/html')

  doc.querySelectorAll('.gap-placeholder').forEach((span) => {
    const order = extractOrder(span.dataset.questionId)
    const question = order != null ? findQuestionByOrder(order) : null

    if (!question) {
      span.textContent = '____'
      span.classList.add('gap-orphan')
      return
    }

    const slot = doc.createElement('button')
    slot.type = 'button'
    slot.className = 'gap-slot'
    slot.dataset.questionId = String(question.id)
    slot.dataset.order = String(question.order ?? '')
    slot.setAttribute('aria-label', `Câu ${question.order}`)
    if (props.disabled) slot.disabled = true

    const orderEl = doc.createElement('span')
    orderEl.className = 'gap-slot__order'
    orderEl.textContent = String(question.order)
    const valueEl = doc.createElement('span')
    valueEl.className = 'gap-slot__value'
    valueEl.textContent = ''
    slot.appendChild(orderEl)
    slot.appendChild(valueEl)

    span.replaceWith(slot)
  })

  containerRef.value.innerHTML = ''
  Array.from(doc.body.childNodes).forEach((n) => {
    containerRef.value.appendChild(n)
  })

  slots.clear()
  containerRef.value.querySelectorAll('.gap-slot').forEach((slot) => {
    const qid = Number(slot.dataset.questionId)
    const question = findQuestionByOrder(Number(slot.dataset.order))
    slots.set(qid, { slot, question })

    const handler = () => {
      if (props.disabled) return
      if (props.reviewMode) {
        emit('select-question', qid)
        return
      }
      activeQuestionId.value = activeQuestionId.value === qid ? null : qid
    }
    slot.addEventListener('click', handler)
    cleanupFns.push(() => slot.removeEventListener('click', handler))
  })

  refreshSlotState()
}

function refreshSlotState() {
  slots.forEach(({ slot, question }, qid) => {
    const value = props.answers[qid] || ''
    const valueEl = slot.querySelector('.gap-slot__value')
    if (valueEl) {
      // Trong review hiển thị chữ cái + correct kế bên
      if (props.reviewMode) {
        const correct = question?.correct_answer || ''
        valueEl.innerHTML = value
          ? `${value}${correct && correct !== value ? ` <em class="gap-slot__hint">(${correct})</em>` : ''}`
          : `<em class="gap-slot__hint">${correct || '—'}</em>`
      } else {
        valueEl.textContent = value ? labelOf(value) : ''
      }
    }
    slot.classList.toggle('gap-slot--filled', !!value)
    slot.classList.toggle('gap-slot--active', !props.reviewMode && activeQuestionId.value === qid)

    slot.classList.remove('gap-slot--correct', 'gap-slot--wrong', 'gap-slot--blank', 'gap-slot--selected')
    if (props.reviewMode) {
      const correct = question?.correct_answer || ''
      if (!value) slot.classList.add('gap-slot--blank')
      else if (correct && value === correct) slot.classList.add('gap-slot--correct')
      else slot.classList.add('gap-slot--wrong')
      if (props.selectedQuestionId === qid) slot.classList.add('gap-slot--selected')
    }
  })
}

function labelOf(option) {
  const found = options.value.find((o) => o.option === option)
  return found ? found.text : option
}

function pickOption(option) {
  if (props.disabled || props.reviewMode) return
  const qid = activeQuestionId.value
  if (qid == null) return

  if (!allowReuse.value && optionUsedBy(option) != null && optionUsedBy(option) !== qid) {
    return
  }
  emit('update:answer', { questionId: qid, value: option })
  activeQuestionId.value = null
}

function clearSlot(qid) {
  if (props.disabled || props.reviewMode) return
  if (!props.answers[qid]) return
  emit('update:answer', { questionId: qid, value: '' })
}

function optionUsedBy(option) {
  for (const q of props.questionSet.questions || []) {
    if (props.answers[q.id] === option) return q.id
  }
  return null
}

function isOptionDisabled(option) {
  if (allowReuse.value) return false
  const usedBy = optionUsedBy(option)
  return usedBy != null && usedBy !== activeQuestionId.value
}

function cleanup() {
  while (cleanupFns.length) cleanupFns.pop()()
  slots.clear()
}

watch(() => props.answers, refreshSlotState, { deep: true })
watch(activeQuestionId, refreshSlotState)
watch(() => props.selectedQuestionId, refreshSlotState)
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

    <!-- Option bank — chỉ hiện khi đang luyện thi, ẩn ở review mode -->
    <footer v-if="!reviewMode" class="bank">
      <div class="bank__hint">
        <template v-if="activeQuestionId">
          Đang chọn cho câu
          <strong>{{ slots.get(activeQuestionId)?.question?.order || '' }}</strong>
          — bấm 1 lựa chọn bên dưới.
        </template>
        <template v-else>
          Bấm vào ô <span class="bank__demo">__</span> trong câu để chọn đáp án.
        </template>
      </div>

      <div class="bank__chips">
        <button
          v-for="opt in options"
          :key="opt.option"
          type="button"
          class="chip"
          :class="{
            'chip--disabled': isOptionDisabled(opt.option),
          }"
          :disabled="disabled || isOptionDisabled(opt.option) || activeQuestionId == null"
          @click="pickOption(opt.option)"
        >
          <span class="chip__letter">{{ opt.option }}</span>
          <span class="chip__text" v-html="opt.text" />
        </button>
      </div>

      <div v-if="activeQuestionId && answers[activeQuestionId]" class="bank__actions">
        <button
          type="button"
          class="bank__clear"
          :disabled="disabled"
          @click="clearSlot(activeQuestionId)"
        >
          Xoá đáp án câu này
        </button>
      </div>
    </footer>

    <!-- Review mode: hiển thị bảng options để tham khảo -->
    <footer v-else class="bank bank--review">
      <div class="bank__hint">Danh sách đáp án (tham khảo):</div>
      <div class="bank__chips">
        <span
          v-for="opt in options"
          :key="opt.option"
          class="chip chip--readonly"
        >
          <span class="chip__letter">{{ opt.option }}</span>
          <span class="chip__text" v-html="opt.text" />
        </span>
      </div>
    </footer>
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

.qset__inline :deep(.gap-slot) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 130px;
  padding: 4px 12px;
  margin: 0 4px;
  background: #f3f4f6;
  border: 1.5px dashed #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
  vertical-align: baseline;
}
.qset__inline :deep(.gap-slot:hover) {
  border-color: #2563eb;
  background: #eff6ff;
}
.qset__inline :deep(.gap-slot--active) {
  background: #dbeafe;
  border: 1.5px solid #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}
.qset__inline :deep(.gap-slot--filled) {
  background: #dcfce7;
  border-color: #16a34a;
  border-style: solid;
}
.qset__inline :deep(.gap-slot--filled.gap-slot--active) {
  background: #bbf7d0;
  border-color: #15803d;
}

/* Review state */
.qset__inline :deep(.gap-slot--correct) {
  background: #dcfce7;
  border: 1.5px solid #16a34a;
}
.qset__inline :deep(.gap-slot--wrong) {
  background: #fee2e2;
  border: 1.5px solid #dc2626;
}
.qset__inline :deep(.gap-slot--blank) {
  background: #f3f4f6;
  border: 1.5px dashed #9ca3af;
}
.qset__inline :deep(.gap-slot--selected) {
  box-shadow: 0 0 0 3px #fdba74;
}
.qset__inline :deep(.gap-slot__hint) {
  font-style: italic;
  font-weight: 600;
  color: #15803d;
  margin-left: 4px;
}

.qset__inline :deep(.gap-slot__order) {
  font-weight: 700;
  color: #2563eb;
  font-size: 13px;
}
.qset__inline :deep(.gap-slot--filled .gap-slot__order) { color: #15803d; }
.qset__inline :deep(.gap-slot--wrong .gap-slot__order) { color: #b91c1c; }
.qset__inline :deep(.gap-slot__value) {
  font-weight: 600;
  color: #166534;
}
.qset__inline :deep(.gap-orphan) {
  color: #9ca3af;
  font-style: italic;
}

.bank {
  margin-top: 4px;
  padding: 14px;
  background: #fefce8;
  border: 1px solid #fde68a;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.bank--review { background: #f9fafb; border-color: #e5e7eb; }
.bank__hint {
  font-size: 13px;
  color: #78350f;
}
.bank--review .bank__hint { color: #4b5563; }
.bank__demo {
  display: inline-block;
  padding: 0 8px;
  background: #f3f4f6;
  border-radius: 4px;
  border: 1px dashed #d1d5db;
  font-size: 12px;
}
.bank__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 999px;
  font-size: 13.5px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}
.chip:hover:not(:disabled) {
  border-color: #2563eb;
  background: #eff6ff;
}
.chip:disabled { cursor: not-allowed; }
.chip--disabled {
  opacity: 0.45;
  background: #f3f4f6;
  color: #6b7280;
}
.chip--readonly { cursor: default; }
.chip__letter {
  font-weight: 800;
  color: #1e40af;
  min-width: 14px;
  text-align: center;
}
.chip__text { color: #1f2937; }
.chip__text :deep(p) { margin: 0; display: inline; }

.bank__actions { display: flex; justify-content: flex-end; }
.bank__clear {
  padding: 6px 12px;
  background: transparent;
  color: #b91c1c;
  border: 0;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}
.bank__clear:hover { text-decoration: underline; }
</style>
