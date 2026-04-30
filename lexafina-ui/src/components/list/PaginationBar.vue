<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  windowSize: { type: Number, default: 5 },
})

const emit = defineEmits(['change'])

// Tạo dải số trang hiển thị: kết hợp page đầu, page cuối, dải giữa quanh current.
// Trả về array gồm số (page) hoặc chuỗi "..." để render gap.
const pages = computed(() => {
  const total = props.totalPages
  const cur = props.currentPage
  const win = props.windowSize

  if (total <= win + 2) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const half = Math.floor(win / 2)
  let start = Math.max(2, cur - half)
  let end = Math.min(total - 1, cur + half)

  if (cur - half < 2) end = Math.min(total - 1, win)
  if (cur + half > total - 1) start = Math.max(2, total - win + 1)

  const arr = [1]
  if (start > 2) arr.push('...')
  for (let i = start; i <= end; i++) arr.push(i)
  if (end < total - 1) arr.push('...')
  arr.push(total)
  return arr
})

function go(p) {
  if (typeof p !== 'number') return
  if (p === props.currentPage) return
  emit('change', p)
}
</script>

<template>
  <nav v-if="totalPages > 1" class="pagination">
    <button
      class="page page--nav"
      :disabled="currentPage <= 1"
      @click="go(currentPage - 1)"
    >
      ‹ Trước
    </button>

    <button
      v-for="(p, i) in pages"
      :key="`${p}-${i}`"
      class="page"
      :class="{
        'page--active': p === currentPage,
        'page--ellipsis': p === '...',
      }"
      :disabled="p === '...'"
      @click="go(p)"
    >
      {{ p }}
    </button>

    <button
      class="page page--nav"
      :disabled="currentPage >= totalPages"
      @click="go(currentPage + 1)"
    >
      Sau ›
    </button>
  </nav>
</template>

<style scoped>
.pagination {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 24px 0;
}
.page {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.15s;
}
.page:hover:not(:disabled):not(.page--ellipsis) {
  border-color: #1e40af;
  color: #1e40af;
}
.page--active {
  background: #1e40af;
  color: #fff;
  border-color: #1e40af;
}
.page--nav { font-weight: 500; }
.page:disabled {
  opacity: 0.5;
  cursor: default;
}
.page--ellipsis { border: 0; cursor: default; background: transparent; }
</style>
