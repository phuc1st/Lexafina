<script setup>
// TODO(auth): hiện tại 2 tab này chưa hook user progress. Sau khi có
// hệ thống auth + bảng submission thật, lọc danh sách theo
// "đã nộp / chưa nộp" của user đang đăng nhập.
defineProps({
  current: { type: String, required: true },
})
defineEmits(['change'])

const tabs = [
  { key: 'unfinished', label: 'Bài chưa làm' },
  { key: 'finished', label: 'Bài đã làm' },
]
</script>

<template>
  <div class="status-tabs">
    <button
      v-for="t in tabs"
      :key="t.key"
      class="pill"
      :class="{ 'pill--active': current === t.key }"
      @click="$emit('change', t.key)"
    >
      {{ t.label }}
    </button>
  </div>
</template>

<style scoped>
.status-tabs {
  display: inline-flex;
  gap: 8px;
}
.pill {
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.15s;
}
.pill:hover { border-color: #16a34a; color: #16a34a; }
.pill--active {
  background: #dcfce7;
  color: #15803d;
  border-color: #16a34a;
}
</style>
