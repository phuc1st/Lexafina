<script setup>
import SkillFilterBlock from './SkillFilterBlock.vue'
import { PARTS_BY_SKILL } from '../../composables/useQuizListing'

defineProps({
  skill: { type: String, required: true },
  mode: { type: String, default: 'quiz' },
  selectedPart: { type: Number, default: null },
})

const emit = defineEmits(['change-skill', 'change-mode', 'change-part'])

const blocks = [
  { key: 'reading', label: 'Reading', icon: '📘', parts: PARTS_BY_SKILL.reading },
  { key: 'listening', label: 'Listening', icon: '🎧', parts: PARTS_BY_SKILL.listening },
]

// Khi user pick mode ở 1 block khác → chuyển sang skill đó luôn
function onSelectMode({ skill, mode }) {
  emit('change-skill', skill)
  emit('change-mode', mode)
}

function onSelectPart({ skill, part }) {
  emit('change-skill', skill)
  emit('change-part', part)
}
</script>

<template>
  <aside class="sidebar">
    <SkillFilterBlock
      v-for="b in blocks"
      :key="b.key"
      :skill-key="b.key"
      :label="b.label"
      :icon="b.icon"
      :parts="b.parts"
      :active="skill === b.key"
      :mode="mode"
      :selected-part="selectedPart"
      @select-mode="onSelectMode"
      @select-part="onSelectPart"
    />
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  flex-shrink: 0;
  padding: 16px;
  background: #f9fafb;
  border-right: 1px solid #e5e7eb;
  min-height: calc(100vh - 50px);
}
</style>
