<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Tìm theo tên bài tập' },
})

const emit = defineEmits(['update:modelValue'])

// Internal buffer để debounce input — tránh trigger filter mỗi ký tự
const buffer = ref(props.modelValue)

watch(
  () => props.modelValue,
  (v) => {
    if (v !== buffer.value) buffer.value = v
  }
)

let timer = null
function onInput(e) {
  buffer.value = e.target.value
  clearTimeout(timer)
  timer = setTimeout(() => emit('update:modelValue', buffer.value), 250)
}

function onSubmit() {
  clearTimeout(timer)
  emit('update:modelValue', buffer.value)
}
</script>

<template>
  <form class="search-bar" @submit.prevent="onSubmit">
    <span class="search-bar__icon">🔍</span>
    <input
      class="search-bar__input"
      type="text"
      :placeholder="placeholder"
      :value="buffer"
      @input="onInput"
    />
    <button type="submit" class="search-bar__btn">Tìm kiếm</button>
  </form>
</template>

<style scoped>
.search-bar {
  display: inline-flex;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 4px 4px 4px 14px;
  min-width: 360px;
}
.search-bar__icon {
  color: #9ca3af;
  margin-right: 8px;
  font-size: 14px;
}
.search-bar__input {
  flex: 1;
  border: 0;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #111827;
}
.search-bar__input::placeholder { color: #9ca3af; }
.search-bar__btn {
  padding: 7px 18px;
  background: #dcfce7;
  color: #15803d;
  border: 0;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.search-bar__btn:hover { background: #bbf7d0; }
</style>
