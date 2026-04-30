<script setup>
import { computed } from 'vue'

/**
 * Render 1 câu hỏi, switch theo `question_type`.
 *
 * Props:
 *  - question: { id, question_type, text, options?, correct_answer? ... globalIndex }
 *  - modelValue: string (đáp án hiện tại; với MULTI_ANSWER là "A,B" join sẵn)
 *  - disabled: boolean
 *  - reviewMode: boolean — bật hiển thị correct + đúng/sai + click để xem giải thích
 *  - resultDetail: { is_correct, user_answer } | null
 *  - selected: boolean — đang được chọn để xem giải thích (highlight)
 *
 * Emit:
 *  - update:modelValue – string
 *  - select – không tham số (review mode click)
 */
const props = defineProps({
  question: { type: Object, required: true },
  modelValue: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  reviewMode: { type: Boolean, default: false },
  resultDetail: { type: Object, default: null },
  selected: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'select'])

// Chuẩn hoá nhóm question_type → 1 trong 4 cách render UI
const renderMode = computed(() => {
  const t = props.question.question_type
  if (t === 'MULTIPLE_CHOICE_MANY') return 'checkbox'
  if (t === 'MULTIPLE_CHOICE_ONE') return 'radio-options'
  if (t === 'TRUE_FALSE') return 'radio-fixed-tfn'
  if (t === 'YES_NO') return 'radio-fixed-yn'
  if (
    t === 'MATCHING_INFO' ||
    t === 'MATCHING_FEATURES' ||
    t === 'MATCHING_ENDINGS'
  )
    return 'text-letter'
  if (t === 'SUMMARY_COMPLETION' || t === 'GAP_FILLING') return 'text-input'
  return 'text-input'
})

const fixedTFN = ['TRUE', 'FALSE', 'NOT GIVEN']
const fixedYN = ['YES', 'NO', 'NOT GIVEN']

// Cho MULTI_ANSWER: parse string "A,E" thành Set để check nhanh
const checkedSet = computed(() => {
  if (!props.modelValue) return new Set()
  return new Set(props.modelValue.split(',').map((s) => s.trim()).filter(Boolean))
})

const isCorrect = computed(() => Boolean(props.resultDetail?.is_correct))
const reviewState = computed(() => {
  if (!props.reviewMode) return 'normal'
  if (!props.modelValue) return 'blank'
  return isCorrect.value ? 'correct' : 'wrong'
})

const correctSet = computed(() => {
  if (Array.isArray(props.question.correct_answers)) {
    return new Set(props.question.correct_answers.map((s) => String(s)))
  }
  if (props.question.correct_answer) {
    return new Set(
      String(props.question.correct_answer)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    )
  }
  return new Set()
})

const correctText = computed(() => {
  if (Array.isArray(props.question.correct_answers)) {
    return props.question.correct_answers.join(', ')
  }
  return props.question.correct_answer || ''
})

function onSingleChange(value) {
  if (props.reviewMode) return
  emit('update:modelValue', value)
}

function onCheckboxToggle(option) {
  if (props.reviewMode) return
  const next = new Set(checkedSet.value)
  if (next.has(option)) next.delete(option)
  else next.add(option)
  emit('update:modelValue', [...next].sort().join(','))
}

function handleClick() {
  if (props.reviewMode) emit('select')
}

function optClass(opt) {
  const base = []
  if (checkedSet.value.has(opt) || props.modelValue === opt) base.push('opt--selected')
  if (!props.reviewMode) return base
  if (correctSet.value.has(opt)) base.push('opt--correct')
  if ((checkedSet.value.has(opt) || props.modelValue === opt) && !correctSet.value.has(opt)) {
    base.push('opt--wrong')
  }
  return base
}
</script>

<template>
  <div
    class="qitem"
    :class="[
      modelValue && !reviewMode ? 'qitem--done' : '',
      reviewMode ? `qitem--${reviewState}` : '',
      selected ? 'qitem--selected' : '',
    ]"
    @click="handleClick"
  >
    <div class="qitem__head">
      <span class="qitem__num">{{ question.displayOrderLabel || question.order || question.globalIndex }}</span>
      <span class="qitem__text" v-html="question.text || ''" />
      <span v-if="reviewMode" class="qitem__badge" :class="`qitem__badge--${reviewState}`">
        {{ reviewState === 'correct' ? '✓' : reviewState === 'wrong' ? '✗' : '—' }}
      </span>
    </div>

    <div class="qitem__body">
      <!-- Multiple choice (1 đáp án) -->
      <div v-if="renderMode === 'radio-options'" class="opts">
        <label
          v-for="opt in question.options || []"
          :key="opt.option"
          class="opt"
          :class="optClass(opt.option)"
        >
          <input
            type="radio"
            :name="`q-${question.id}`"
            :value="opt.option"
            :checked="modelValue === opt.option"
            :disabled="disabled || reviewMode"
            @change="onSingleChange(opt.option)"
          />
          <span class="opt__letter">{{ opt.option }}</span>
          <span class="opt__text" v-html="opt.text" />
        </label>
      </div>

      <!-- Multiple answers -->
      <div v-else-if="renderMode === 'checkbox'" class="opts">
        <label
          v-for="opt in question.options || []"
          :key="opt.option"
          class="opt"
          :class="optClass(opt.option)"
        >
          <input
            type="checkbox"
            :value="opt.option"
            :checked="checkedSet.has(opt.option)"
            :disabled="disabled || reviewMode"
            @change="onCheckboxToggle(opt.option)"
          />
          <span class="opt__letter">{{ opt.option }}</span>
          <span class="opt__text" v-html="opt.text" />
        </label>
      </div>

      <!-- TRUE / FALSE / NOT GIVEN -->
      <div v-else-if="renderMode === 'radio-fixed-tfn'" class="opts opts--inline">
        <label
          v-for="v in fixedTFN"
          :key="v"
          class="opt opt--compact"
          :class="optClass(v)"
        >
          <input
            type="radio"
            :name="`q-${question.id}`"
            :value="v"
            :checked="modelValue === v"
            :disabled="disabled || reviewMode"
            @change="onSingleChange(v)"
          />
          <span>{{ v }}</span>
        </label>
      </div>

      <!-- YES / NO / NOT GIVEN -->
      <div v-else-if="renderMode === 'radio-fixed-yn'" class="opts opts--inline">
        <label
          v-for="v in fixedYN"
          :key="v"
          class="opt opt--compact"
          :class="optClass(v)"
        >
          <input
            type="radio"
            :name="`q-${question.id}`"
            :value="v"
            :checked="modelValue === v"
            :disabled="disabled || reviewMode"
            @change="onSingleChange(v)"
          />
          <span>{{ v }}</span>
        </label>
      </div>

      <!-- Matching: nhập 1 chữ cái -->
      <div v-else-if="renderMode === 'text-letter'" class="text-input-wrap">
        <input
          type="text"
          maxlength="2"
          class="text-input text-input--letter"
          :value="modelValue"
          :disabled="disabled || reviewMode"
          placeholder="A-G"
          @input="onSingleChange($event.target.value.toUpperCase())"
        />
        <span v-if="reviewMode" class="answer-hint">
          Đáp án: <strong>{{ correctText || '—' }}</strong>
        </span>
      </div>

      <!-- Fill-in / Summary completion -->
      <div v-else class="text-input-wrap">
        <input
          type="text"
          class="text-input"
          :value="modelValue"
          :disabled="disabled || reviewMode"
          placeholder="Your answer"
          @input="onSingleChange($event.target.value)"
        />
        <span v-if="reviewMode" class="answer-hint">
          Đáp án: <strong>{{ correctText || '—' }}</strong>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qitem {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
}
.qitem--done {
  border-color: #93c5fd;
  background: #f0f7ff;
}
.qitem--correct { border-color: #86efac; background: #f0fdf4; }
.qitem--wrong   { border-color: #fca5a5; background: #fef2f2; }
.qitem--blank   { border-color: #e5e7eb; background: #fafafa; }
.qitem--selected { box-shadow: 0 0 0 2px #f97316; }

.qitem__head {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 15px;
  line-height: 1.5;
  cursor: pointer;
}
.qitem__num {
  flex: 0 0 auto;
  min-width: 26px;
  height: 26px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #1e40af;
  color: #fff;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}
.qitem__text { flex: 1; }
.qitem__body { padding-left: 36px; }

.qitem__badge {
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}
.qitem__badge--correct { background: #16a34a; color: #fff; }
.qitem__badge--wrong   { background: #dc2626; color: #fff; }
.qitem__badge--blank   { background: #d1d5db; color: #4b5563; }

.opts { display: flex; flex-direction: column; gap: 8px; }
.opts--inline { flex-direction: row; flex-wrap: wrap; }

.opt {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  font-size: 14px;
  line-height: 1.4;
}
.opt:hover { background: #f9fafb; }
.opt--selected { background: #dbeafe; border-color: #2563eb; }
.opt--compact { padding: 6px 14px; }
.opt input { margin-top: 3px; accent-color: #2563eb; }
.opt__letter {
  font-weight: 700;
  color: #1e40af;
  min-width: 18px;
}
.opt__text { flex: 1; }
.opt__text :deep(p) { margin: 0; }

.opt--correct {
  background: #dcfce7 !important;
  border-color: #16a34a !important;
}
.opt--correct .opt__letter { color: #15803d; }
.opt--wrong {
  background: #fee2e2 !important;
  border-color: #dc2626 !important;
}
.opt--wrong .opt__letter { color: #b91c1c; }

.text-input-wrap {
  padding-top: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.text-input {
  width: 100%;
  max-width: 320px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}
.text-input:focus { outline: 2px solid #2563eb; border-color: #2563eb; }
.text-input--letter {
  width: 60px;
  text-align: center;
  font-weight: 700;
  text-transform: uppercase;
}
.answer-hint {
  font-size: 13px;
  color: #6b7280;
}
.answer-hint strong { color: #15803d; }
</style>
