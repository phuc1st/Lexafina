<script setup>
/**
 * Layout chung cho cả Reading và Listening.
 * - Slot "left"     : passage hoặc audio
 * - Slot "right"    : QuestionList
 * - Slot "header"   : tabs + timer + submit
 * - Slot "sheet"    : AnswerSheet
 * - Slot "explain"  : panel giải thích cố định ở đáy cột phải (review mode)
 */
defineProps({
  title: { type: String, default: '' },
})
</script>

<template>
  <div class="layout">
    <header class="layout__header">
      <div class="layout__brand">
        <span class="dot" />
        <span>Lexafina · {{ title }}</span>
      </div>
      <div class="layout__header-right">
        <slot name="header" />
      </div>
    </header>

    <main class="layout__body">
      <section class="layout__left">
        <slot name="left" />
      </section>

      <section class="layout__right">
        <div class="layout__main">
          <div class="layout__questions">
            <slot name="right" />
          </div>
          <div v-if="$slots.explain" class="layout__explain">
            <slot name="explain" />
          </div>
        </div>
        <div class="layout__sheet">
          <slot name="sheet" />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f3f6fb;
}
.layout__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  z-index: 10;
}
.layout__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #111827;
}
.dot {
  width: 10px;
  height: 10px;
  background: #2563eb;
  border-radius: 50%;
  display: inline-block;
}
.layout__header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.layout__body {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px;
  min-height: 0;
}
.layout__left {
  min-height: 0;
  overflow: hidden;
}
.layout__right {
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 16px;
}
.layout__main {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.layout__questions {
  flex: 1;
  min-height: 0;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 20px 24px;
  overflow-y: auto;
}
.layout__explain {
  flex-shrink: 0;
  max-height: 38vh;
  overflow-y: auto;
}
.layout__sheet { min-width: 220px; }

@media (max-width: 1024px) {
  .layout__body { grid-template-columns: 1fr; }
  .layout__right { grid-template-columns: 1fr; }
}
</style>
