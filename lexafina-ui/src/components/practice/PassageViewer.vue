<script setup>
/**
 * Reading-only: render HTML passage trong panel scroll riêng.
 * Backend trả về `content` đã có HTML từ youpass nên dùng v-html.
 */
defineProps({
  title: { type: String, default: '' },
  html: { type: String, default: '' },
})
</script>

<template>
  <div class="passage">
    <h2 v-if="title" class="passage__title">{{ title }}</h2>
    <article class="passage__body" v-html="html" />
  </div>
</template>

<style scoped>
.passage {
  height: 100%;
  overflow-y: auto;
  padding: 20px 24px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}
.passage__title {
  margin: 0 0 16px;
  font-size: 20px;
  color: #111827;
}
.passage__body {
  font-size: 15px;
  line-height: 1.7;
  color: #1f2937;
}
.passage__body :deep(p) { margin: 0 0 12px; }
.passage__body :deep(h2),
.passage__body :deep(h3) { margin: 18px 0 10px; }
.passage__body :deep(strong) { color: #111827; }
</style>
