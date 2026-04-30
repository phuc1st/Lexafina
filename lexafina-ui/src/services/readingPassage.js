/**
 * Normalize 1 part của Reading thành ViewModel cho UI.
 *
 * Quy ước paragraph index (theo `paragraph_ranges` trong locate_info):
 *   - Đếm theo vị trí trong mảng `vocabs` (1-based, kể cả block trống).
 *   - Empty vocabs vẫn chiếm 1 paragraph index (dù không render).
 *
 * Output:
 *   {
 *     instructionTitle, instructionHtml, passageTitleHtml,
 *     passageBlocks: [{
 *       id, paragraphIndex,        // 1-based theo vocabs array gốc
 *       sentences: Array<Array<string>>  // [sentence][word]
 *     }],
 *     questionSets,
 *   }
 */

export function buildReadingPartViewModel(part) {
  if (!part) return null

  const { startOrder, endOrder } = computeQuestionOrderRange(part)

  return {
    instructionTitle: part?.instruction?.title || '',
    instructionHtml: replaceQuestionTokens(
      part?.instruction?.content || '',
      startOrder,
      endOrder
    ),
    passageTitleHtml: part?.content || '',
    passageBlocks: normalizeVocabs(part?.vocabs || []),
    questionSets: part?.question_sets || [],
  }
}

function computeQuestionOrderRange(part) {
  let min = Infinity
  let max = -Infinity
  for (const qs of part?.question_sets || []) {
    for (const q of qs?.questions || []) {
      const o = Number(q.order)
      if (!Number.isFinite(o)) continue
      if (o < min) min = o
      if (o > max) max = o
    }
  }
  if (!Number.isFinite(min)) return { startOrder: null, endOrder: null }
  return { startOrder: min, endOrder: max }
}

function replaceQuestionTokens(html, start, end) {
  if (!html) return ''
  if (start == null || end == null) return html
  return html
    .replace(/\{start_question\}/g, String(start))
    .replace(/\{end_question\}/g, String(end))
}

/**
 * Build blocks visible với paragraphIndex giữ nguyên position trong vocabs gốc.
 * Empty vocabs bị skip nhưng vẫn cộng index.
 *
 * QUAN TRỌNG:
 * - Không tự split câu bằng regex nữa.
 * - Mỗi `children.value` trong JSON được xem là 1 sentence unit gốc.
 * - Nếu có `value` ở parent thì xem như 1 sentence unit bổ sung.
 */
function normalizeVocabs(vocabs) {
  const blocks = []
  vocabs.forEach((v, i) => {
    if (!v) return
    const paragraphIndex = i + 1

    const parentText = (v.value || '').trim()
    const childrenTexts = (v.children || [])
      .filter((c) => c && (c.value || '').trim() !== '')
      .map((c) => c.value.trim())

    if (!parentText && childrenTexts.length === 0) return

    // Giữ sentence boundary theo JSON gốc: mỗi child là 1 câu.
    const sentenceUnits = []
    if (parentText) sentenceUnits.push(parentText)
    sentenceUnits.push(...childrenTexts)
    const sentences = sentenceUnits.map(tokenizeSentence)

    blocks.push({
      id: v.id,
      paragraphIndex,
      sentences,
    })
  })
  return blocks
}

function tokenizeSentence(sentence) {
  return sentence.split(/\s+/).filter(Boolean)
}
