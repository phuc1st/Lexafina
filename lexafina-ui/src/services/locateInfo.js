/**
 * Trích xuất toàn bộ paragraph_ranges từ locate_info, kể cả dạng lồng:
 * - { paragraph_ranges: [...] }
 * - { "0": { paragraph_ranges: [...] }, "1": { paragraph_ranges: [...] } }
 * - hoặc lồng sâu hơn.
 */
export function extractLocateRanges(locateInfo) {
  if (!locateInfo || typeof locateInfo !== 'object') return []

  const out = []
  walkLocateNode(locateInfo, out)
  return dedupeRanges(out)
}

function walkLocateNode(node, out) {
  if (!node || typeof node !== 'object') return

  if (Array.isArray(node.paragraph_ranges)) {
    for (const r of node.paragraph_ranges) {
      if (isValidRange(r)) out.push(r)
    }
  }

  if (Array.isArray(node)) {
    for (const item of node) walkLocateNode(item, out)
    return
  }

  for (const value of Object.values(node)) {
    if (value && typeof value === 'object') {
      walkLocateNode(value, out)
    }
  }
}

function isValidRange(r) {
  return Boolean(
    r &&
      r.start &&
      r.end &&
      Number.isFinite(Number(r.start.paragraph)) &&
      Number.isFinite(Number(r.start.sentence)) &&
      Number.isFinite(Number(r.start.index)) &&
      Number.isFinite(Number(r.end.paragraph)) &&
      Number.isFinite(Number(r.end.sentence)) &&
      Number.isFinite(Number(r.end.index))
  )
}

function dedupeRanges(ranges) {
  const seen = new Set()
  const uniq = []
  for (const r of ranges) {
    const key = [
      r.start.paragraph,
      r.start.sentence,
      r.start.index,
      r.end.paragraph,
      r.end.sentence,
      r.end.index,
    ].join('|')
    if (seen.has(key)) continue
    seen.add(key)
    uniq.push(r)
  }
  return uniq
}

