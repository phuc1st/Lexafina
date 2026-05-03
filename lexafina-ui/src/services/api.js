// Wrapper đơn giản gọi backend Spring Boot.
// Dùng fetch native — không cần thêm dependency.
// Backend trả về { code, message, data } → unwrap thành data luôn.

const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`)
  }
  const json = await res.json()
  if (json.code !== 0) {
    throw new Error(json.message || 'Unknown API error')
  }
  return json.data
}

export const api = {
  listMockTests: ({ skill = 'reading', page = 1, pageSize = 10, sort = 'desc' } = {}) =>
    request(`/mock-tests?skill=${skill}&page=${page}&page_size=${pageSize}&sort=${sort}`),

  /**
   * API: GET /api/quizzes
   * Params:
   * - skill: reading|listening|writing|speaking
   * - part: filter part (reading/listening/speaking)
   * - taskType: 1|2 (chỉ cho writing, map -> task_type)
   * - page, pageSize, sort
   * Response: PagedResponse<QuizSummary>
   */
  listQuizzes: ({
    skill = 'reading',
    part = null,
    taskType = null,
    page = 1,
    pageSize = 16,
    sort = 'desc',
  } = {}) => {
    const qs = new URLSearchParams({
      skill,
      page: String(page),
      page_size: String(pageSize),
      sort,
    })
    if (part != null) qs.set('part', String(part))
    if (taskType != null) qs.set('task_type', String(taskType))
    return request(`/quizzes?${qs.toString()}`)
  },

  getMockTest: (testId) => request(`/mock-tests/${testId}`),

  getQuiz: (quizId) => request(`/quizzes/${quizId}`),

  submit: (quizId, answers) =>
    request('/submissions', {
      method: 'POST',
      body: JSON.stringify({ quizId, answers }),
    }),

  /**
   * API: POST /api/writing/submissions
   * Nhận bài Writing (4 khối). Response: { quizId, received }.
   * @param {{ quizId: number, introduction?: string, overview?: string, body1?: string, body2?: string, wordCount?: number }} payload
   */
  submitWriting: (payload) =>
    request('/writing/submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
