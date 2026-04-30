/**
 * Chuẩn hóa dữ liệu speaking thành cấu trúc part/question để UI dễ render.
 * @param {object|null} quizRaw dữ liệu từ GET /api/quizzes/{id}
 * @returns {object}
 */
export function mapSpeakingQuiz(quizRaw) {
  const quiz = quizRaw || {}
  const parts = Array.isArray(quiz.parts) ? quiz.parts : []

  const normalizedParts = parts
    .slice()
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
    .map((part, idx) => {
      const rawQuestions = Array.isArray(part.questions) ? part.questions : []
      const questions = rawQuestions
        .slice()
        .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
        .map((q, qIdx) => ({
          id: q.id || `${part.id}-${qIdx}`,
          title: q.title || `Question ${qIdx + 1}`,
          description: q.description || '',
          audioUrl: q.audio_url || '',
          timeLimit: Number(q.time_limit) || 30,
          thinkTime: Number(q.time_to_think) || 0,
          order: Number(q.order) || qIdx + 1,
        }))

      return {
        id: part.id || idx + 1,
        title: part.title || `Part ${idx + 1}`,
        sort: Number(part.sort || idx + 1),
        timeMinutes: Number(part.time) || 0,
        instructionHtml: part.instruction?.content || '',
        questions,
      }
    })

  return {
    id: quiz.id,
    title: quiz.title || 'Speaking Practice',
    timeMinutes: Number(quiz.time) || 13,
    parts: normalizedParts,
  }
}
