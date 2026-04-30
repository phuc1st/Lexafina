import { imageUrl } from './assets'

/**
 * Chuẩn hóa dữ liệu quiz Writing từ backend thành ViewModel cho UI.
 * @param {object|null} quizRaw dữ liệu từ GET /api/quizzes/{id}
 * @returns {object}
 */
export function mapWritingQuiz(quizRaw) {
  const quiz = quizRaw || {}
  const q = Array.isArray(quiz.questions) ? quiz.questions[0] || {} : {}
  const graphImage = q.writing_graph_image || quiz.writing_graph_image

  return {
    id: quiz.id,
    title: quiz.title || 'Writing Practice',
    timeMinutes: Number(quiz.time) || 60,
    taskType: Number(quiz.writing_task_type) || null,
    promptTitle: q.title || quiz.title || '',
    promptHtml: safeHtml(q.content_writing || ''),
    instructionHtml: safeHtml(q.instruction || ''),
    logicalFrames: normalizeLogicalFrames(q.writing_logical_frame),
    minWords: Number(q.min_words) || 120,
    maxWords: Number(q.max_words) || 400,
    graphImageUrl: imageUrl(graphImage),
    graphDescription: q.writing_graph_description || '',
  }
}

function normalizeLogicalFrames(frames) {
  if (!Array.isArray(frames)) return []
  return frames
    .slice()
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
    .map((f) => ({
      id: f.id,
      name: f.name || 'Reference',
      html: safeHtml(f.value || ''),
      enabled: Boolean(f.is_toggle_on),
    }))
}

/**
 * Sanitize tối thiểu cho nội dung HTML từ API.
 */
function safeHtml(html) {
  if (!html) return ''
  return String(html)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
}
