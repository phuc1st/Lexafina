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

  // Phân trang theo bài lẻ (Reading: part 1-3, Listening: part 1-4).
  // part = null/undefined → backend trả tất cả part.
  listQuizzes: ({ skill = 'reading', part = null, page = 1, pageSize = 16, sort = 'desc' } = {}) => {
    const qs = new URLSearchParams({
      skill,
      page: String(page),
      page_size: String(pageSize),
      sort,
    })
    if (part != null) qs.set('part', String(part))
    return request(`/quizzes?${qs.toString()}`)
  },

  getMockTest: (testId) => request(`/mock-tests/${testId}`),

  getQuiz: (quizId) => request(`/quizzes/${quizId}`),

  submit: (quizId, answers) =>
    request('/submissions', {
      method: 'POST',
      body: JSON.stringify({ quizId, answers }),
    }),
}
