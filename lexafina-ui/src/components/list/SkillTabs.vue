<script setup>
const props = defineProps({
  current: { type: String, required: true },
})

defineEmits(['change'])

const tabs = [
  { key: 'reading', label: 'Reading', icon: '📘', enabled: true },
  { key: 'listening', label: 'Listening', icon: '🎧', enabled: true },
  { key: 'writing', label: 'Writing', icon: '✏️', enabled: false },
  { key: 'speaking', label: 'Speaking', icon: '🎙️', enabled: false },
]
</script>

<template>
  <nav class="skill-tabs">
    <button
      v-for="t in tabs"
      :key="t.key"
      class="tab"
      :class="{
        'tab--active': props.current === t.key,
        'tab--disabled': !t.enabled,
      }"
      :disabled="!t.enabled"
      :title="t.enabled ? '' : 'Sắp ra mắt'"
      @click="t.enabled && $emit('change', t.key)"
    >
      <span class="tab__icon">{{ t.icon }}</span>
      <span>{{ t.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.skill-tabs {
  display: flex;
  gap: 6px;
  align-items: center;
  background: #fff;
  padding: 0 24px;
  border-bottom: 1px solid #e5e7eb;
}
.tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 14px 18px;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.tab:hover:not(.tab--disabled) {
  color: #1e40af;
}
.tab--active {
  color: #1e40af;
  border-bottom-color: #1e40af;
}
.tab--disabled {
  color: #d1d5db;
  cursor: not-allowed;
}
.tab__icon {
  font-size: 16px;
}
</style>
