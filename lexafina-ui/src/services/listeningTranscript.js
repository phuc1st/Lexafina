/**
 * Build transcript rows from Listening part.vocabs.
 * Keep paragraph index = i + 1 (same rule as locate_info).
 * Each child.value is considered one sentence row.
 */
export function buildListeningTranscriptRows(part, partIndex = 0) {
  if (!part) return []
  const rows = []
  const vocabs = part.vocabs || []

  vocabs.forEach((v, i) => {
    if (!v) return
    const paragraphIndex = i + 1
    const children = (v.children || []).filter((c) => c && String(c.value || '').trim() !== '')
    let sentenceIdx = 1

    children.forEach((c) => {
      rows.push({
        id: `p${part.id}-para${paragraphIndex}-s${sentenceIdx}`,
        partId: part.id,
        partIndex,
        paragraphIndex,
        sentenceIndex: sentenceIdx,
        text: String(c.value || '').trim(),
        speaker: c.meta?.speaker || '',
        from: Number.isFinite(Number(c.meta?.from)) ? Number(c.meta.from) : null,
        to: Number.isFinite(Number(c.meta?.to)) ? Number(c.meta.to) : null,
      })
      sentenceIdx++
    })
  })

  return rows
}

export function attachGlobalTime(rows, partOffsets) {
  return rows.map((r) => {
    const offset = Number(partOffsets?.[r.partIndex] || 0)
    const hasTime = r.from != null && r.to != null
    return {
      ...r,
      globalFrom: hasTime ? offset + r.from : null,
      globalTo: hasTime ? offset + r.to : null,
    }
  })
}

export function buildPartOffsets(durationByTrack, trackCount) {
  const offsets = {}
  let sum = 0
  for (let i = 0; i < trackCount; i++) {
    offsets[i] = sum
    sum += Number(durationByTrack?.[i] || 0)
  }
  return offsets
}

