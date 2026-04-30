/**
 * Mapping question_type code -> nhãn hiển thị thân thiện cho UI.
 * Dùng cho ResultPage breakdown table và mọi nơi cần hiển thị tên loại.
 */
const LABELS = {
  TRUE_FALSE: 'True / False / Not Given',
  YES_NO: 'Yes / No / Not Given',
  SINGLE_SELECTION: 'Single Selection',
  SINGLE_CHOICE: 'Single Choice',
  MULTIPLE_CHOICE_ONE: 'Multiple Choice (One Answer)',
  MULTIPLE_CHOICE_MANY: 'Multiple Choice (Multiple Answers)',
  MATCHING_INFO: 'Matching Information',
  MATCHING_FEATURES: 'Matching Features',
  MATCHING_ENDINGS: 'Matching Endings',
  GAP_FILLING: 'Gap Filling',
  SUMMARY_COMPLETION: 'Summary Completion',
  TABLE_SELECTION: 'Table Completion',
  UNKNOWN: 'Khác',
}

export function questionTypeLabel(code) {
  if (!code) return LABELS.UNKNOWN
  return LABELS[code] || prettify(code)
}

function prettify(code) {
  return code
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
