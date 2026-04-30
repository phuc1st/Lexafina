<script setup>
import MockTestCard from './MockTestCard.vue'

defineProps({
  book: { type: Object, required: true }, // BookGroup: { title, mock_tests, total }
  skill: { type: String, required: true },
})
</script>

<template>
  <section class="group">
    <header class="group__header">
      <h2 class="group__title">{{ book.title }}</h2>
    </header>

    <div class="group__grid">
      <MockTestCard
        v-for="mt in book.mock_tests"
        :key="mt.id"
        :mock-test="mt"
        :skill="skill"
      />
    </div>
  </section>
</template>

<style scoped>
.group {
  margin-bottom: 32px;
}
.group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0 14px;
}
.group__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}
.group__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 1100px) {
  .group__grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 800px) {
  .group__grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
