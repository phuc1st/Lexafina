<script setup>
defineProps({
  parts: { type: Array, required: true },
  currentIdx: { type: Number, required: true },
})
const emit = defineEmits(['change'])
</script>

<template>
  <nav class="tabs">
    <button
      v-for="(p, i) in parts"
      :key="p.id"
      class="tab"
      :class="{ 'tab--active': i === currentIdx }"
      @click="emit('change', i)"
    >
      Part {{ i + 1 }}
    </button>
  </nav>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #f3f4f6;
  border-radius: 10px;
}
.tab {
  flex: 1;
  padding: 8px 14px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}
.tab:hover { color: #1e40af; }
.tab--active {
  background: #fff;
  color: #1e40af;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
</style>
