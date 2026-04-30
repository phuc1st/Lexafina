<script setup>
import { ref, defineExpose, nextTick } from 'vue'

/**
 * Render panel trái của Reading.
 *
 * Mỗi từ trong body được gói trong span có data-attribute (data-p, data-s, data-w)
 * để có thể highlight chính xác theo `paragraph_ranges` của locate_info.
 *
 * Convention paragraph index:
 *   - Đếm theo vị trí trong vocabs array (1-based, đã chuẩn hoá ở readingPassage.js).
 *
 * Expose:
 *   - highlightRange(ranges)  : Array<{start: {paragraph, sentence, index}, end: {...}}>
 *   - clearHighlight()
 */
defineProps({
  vm: {
    type: Object,
    required: true,
  },
})

const passageRef = ref(null)
const lastHighlighted = []

function clearHighlight() {
  while (lastHighlighted.length) {
    const el = lastHighlighted.pop()
    el.classList.remove('passage__word--hl')
  }
}

async function highlightRange(ranges) {
  clearHighlight()
  if (!ranges || !ranges.length || !passageRef.value) return
  await nextTick()

  let firstEl = null

  for (const range of ranges) {
    const start = range?.start
    const end = range?.end
    if (!start || !end) continue
    // Trong cùng paragraph: highlight giữa start.sentence/index và end.sentence/index.
    // Nếu khác paragraph: hiện chưa hỗ trợ liên đoạn — fallback highlight
    // các sentences trong từng paragraph từ start.paragraph đến end.paragraph.
    if (start.paragraph === end.paragraph) {
      highlightWithinParagraph(start.paragraph, start.sentence, start.index, end.sentence, end.index)
    } else {
      highlightWithinParagraph(start.paragraph, start.sentence, start.index, Infinity, Infinity)
      for (let p = start.paragraph + 1; p < end.paragraph; p++) {
        highlightWithinParagraph(p, 1, 1, Infinity, Infinity)
      }
      highlightWithinParagraph(end.paragraph, 1, 1, end.sentence, end.index)
    }

    if (!firstEl && lastHighlighted.length) firstEl = lastHighlighted[0]
  }

  if (firstEl) {
    firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

function highlightWithinParagraph(p, sStart, idxStart, sEnd, idxEnd) {
  if (!passageRef.value) return
  const words = passageRef.value.querySelectorAll(`[data-p="${p}"]`)
  words.forEach((el) => {
    const s = Number(el.dataset.s)
    const w = Number(el.dataset.w)
    if (!Number.isFinite(s) || !Number.isFinite(w)) return
    // In range nếu (s > sStart) || (s == sStart && w >= idxStart)
    // và (s < sEnd) || (s == sEnd && w <= idxEnd)
    const afterStart = s > sStart || (s === sStart && w >= idxStart)
    const beforeEnd = s < sEnd || (s === sEnd && w <= idxEnd)
    if (afterStart && beforeEnd) {
      el.classList.add('passage__word--hl')
      lastHighlighted.push(el)
    }
  })
}

defineExpose({ highlightRange, clearHighlight })
</script>

<template>
  <div ref="passageRef" class="passage">
    <header v-if="vm.instructionTitle || vm.instructionHtml" class="passage__instruction">
      <h3 v-if="vm.instructionTitle" class="passage__instruction-title">
        {{ vm.instructionTitle }}
      </h3>
      <div
        v-if="vm.instructionHtml"
        class="passage__instruction-body"
        v-html="vm.instructionHtml"
      />
    </header>

    <div
      v-if="vm.passageTitleHtml"
      class="passage__title"
      v-html="vm.passageTitleHtml"
    />

    <article class="passage__body">
      <p
        v-for="block in vm.passageBlocks"
        :key="block.id"
        class="passage__block"
      >
        <template
          v-for="(words, sIdx) in block.sentences"
          :key="`${block.id}-s${sIdx}`"
        >
          <template
            v-for="(w, wIdx) in words"
            :key="`${block.id}-s${sIdx}-w${wIdx}`"
          >
            <span
              class="passage__word"
              :data-p="block.paragraphIndex"
              :data-s="sIdx + 1"
              :data-w="wIdx + 1"
            >{{ w }}</span>
          </template>
        </template>
      </p>
    </article>
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

.passage__instruction {
  background: #f8fafc;
  border-left: 4px solid #2563eb;
  padding: 10px 14px;
  border-radius: 0 8px 8px 0;
  margin-bottom: 18px;
}
.passage__instruction-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: #1e40af;
}
.passage__instruction-body {
  font-size: 13.5px;
  line-height: 1.55;
  color: #1f2937;
}
.passage__instruction-body :deep(p) { margin: 0; }

.passage__title {
  margin: 16px 0 10px;
  text-align: center;
  font-size: 22px;
  color: #111827;
}
.passage__title :deep(h2) { margin: 0; }
.passage__title :deep(strong) { font-weight: 700; }

.passage__body {
  font-size: 15px;
  line-height: 1.85;
  color: #1f2937;
}
.passage__block {
  margin: 0 0 14px;
}
.passage__word {
  display: inline-block;
  margin-right: 0.28em;
  transition: background 0.15s;
}
.passage__word--hl {
  background: #fef08a;
  padding: 0 2px;
  border-radius: 3px;
  box-shadow: 0 0 0 1px #facc15 inset;
}
</style>
