<script setup>
/**
 * 1 block trong sidebar (Reading hoặc Listening).
 * - Hiển thị radio "Bài lẻ" / "Full đề"
 * - Khi block đang active (skill đang chọn) + mode='quiz' → hiện list radio Passage
 *
 * Single-source-of-truth: state sống ở composable bên ngoài; component này
 * chỉ render và emit user intent.
 */
const props = defineProps({
  skillKey: { type: String, required: true }, // 'reading' | 'listening'
  label: { type: String, required: true },
  icon: { type: String, default: '📘' },
  parts: { type: Array, required: true }, // [1,2,3] hoặc [1,2,3,4]
  active: { type: Boolean, default: false }, // skill này có đang được chọn?
  mode: { type: String, default: 'quiz' },
  selectedPart: { type: Number, default: null },
})

const emit = defineEmits(['select-mode', 'select-part'])

function pickMode(m) {
  emit('select-mode', { skill: props.skillKey, mode: m })
}

function pickPart(p) {
  // toggle: click lại part đang chọn → bỏ chọn
  const next = props.selectedPart === p ? null : p
  emit('select-part', { skill: props.skillKey, part: next })
}
</script>

<template>
  <section class="block" :class="{ 'block--active': active }">
    <header class="block__header">
      <span class="block__icon">{{ icon }}</span>
      <span class="block__label">{{ label }}</span>
    </header>

    <div class="block__body">
      <label class="row">
        <input
          type="radio"
          :name="`mode-${skillKey}`"
          :checked="active && mode === 'quiz'"
          @change="pickMode('quiz')"
        />
        <span>Bài lẻ</span>
      </label>

      <ul v-if="active && mode === 'quiz'" class="parts">
        <li v-for="p in parts" :key="p">
          <label class="row row--sub">
            <input
              type="radio"
              :name="`part-${skillKey}`"
              :checked="selectedPart === p"
              @change="pickPart(p)"
            />
            <span>Passage {{ p }}</span>
          </label>
        </li>
      </ul>

      <label class="row">
        <input
          type="radio"
          :name="`mode-${skillKey}`"
          :checked="active && mode === 'mocktest'"
          @change="pickMode('mocktest')"
        />
        <span>Full đề</span>
      </label>
    </div>
  </section>
</template>

<style scoped>
.block {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  margin-bottom: 12px;
  overflow: hidden;
}
.block--active {
  border-color: #16a34a;
}
.block__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f0fdf4;
  font-size: 13px;
  font-weight: 700;
  color: #166534;
}
.block--active .block__header {
  background: #dcfce7;
}
.block__icon { font-size: 14px; }
.block__body {
  padding: 10px 14px;
}
.row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  cursor: pointer;
  font-size: 13px;
  color: #374151;
}
.row input[type='radio'] {
  accent-color: #16a34a;
  cursor: pointer;
}
.row--sub {
  padding-left: 22px;
  font-size: 12.5px;
  color: #4b5563;
}
.parts {
  list-style: none;
  padding: 0;
  margin: 4px 0 6px 0;
}
</style>
