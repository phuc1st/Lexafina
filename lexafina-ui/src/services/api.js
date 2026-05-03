// Gọi backend /api: fetch + cookie (refresh), access JWT trong memory (Pinia) qua wireAuthStore.
// Cấu hình: wireAuthStore(useAuthStore()) ngay sau app.use(pinia) để tránh import vòng.

const BASE = '/api'

let getAccessToken = () => ''
let onRefreshed = () => {}
let onUnauthorized = () => {}

/**
 * Nối Pinia auth store với module API (token + session sau refresh / 401).
 * @param {import('pinia').Store} authStore store từ useAuthStore()
 */
export function wireAuthStore(authStore) {
  getAccessToken = () => authStore.accessToken
  onRefreshed = (data) => {
    authStore.setAuth({
      accessToken: data.accessToken,
      user: data.user,
    })
  }
  onUnauthorized = () => authStore.clearSession()
}

function buildHeaders(baseHeaders) {
  const h = new Headers(baseHeaders)
  if (!h.has('Content-Type')) {
    h.set('Content-Type', 'application/json')
  }
  const t = getAccessToken()
  if (t) {
    h.set('Authorization', `Bearer ${t}`)
  }
  return h
}

async function rawFetch(path, options = {}) {
  return fetch(BASE + path, {
    credentials: 'include',
    ...options,
    headers: buildHeaders(options.headers),
  })
}

function shouldAttemptRefreshOn401(path) {
  return (
    !path.startsWith('/auth/refresh') &&
    !path.startsWith('/auth/login') &&
    !path.startsWith('/auth/register')
  )
}

/**
 * Gọi POST /auth/refresh; cập nhật store qua onRefreshed.
 * @returns {Promise<boolean>}
 */
async function tryRefreshSession() {
  /** Refresh chỉ dùng cookie — không gửi Bearer (tránh JWT hết hạn làm nhiễu). */
  const res = await fetch(BASE + '/auth/refresh', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
  const text = await res.text()
  let json = {}
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      return false
    }
  }
  if (!res.ok || json.code !== 0 || !json.data?.accessToken) {
    return false
  }
  onRefreshed(json.data)
  return true
}

/**
 * @param {string} path bắt đầu bằng / (ví dụ /quizzes)
 * @param {RequestInit} [options]
 * @param {boolean} [retried] nội bộ — tránh lặp refresh
 * @returns {Promise<any>} json.data
 */
async function request(path, options = {}, retried = false) {
  const res = await rawFetch(path, options)

  if (res.status === 401 && !retried && shouldAttemptRefreshOn401(path)) {
    const ok = await tryRefreshSession()
    if (ok) {
      return request(path, options, true)
    }
    onUnauthorized()
    throw new Error('Phiên đăng nhập hết hạn')
  }

  const text = await res.text()
  let json = {}
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      if (!res.ok) {
        throw new Error(`API ${path} failed: ${res.status}`)
      }
      throw new Error('Invalid JSON from API')
    }
  }

  if (!res.ok) {
    throw new Error(json.message || `API ${path} failed: ${res.status}`)
  }
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
   * @param {object} params
   * @returns {Promise<object>} PagedResponse
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
   * POST /api/writing/submissions
   * @param {object} payload
   */
  submitWriting: (payload) =>
    request('/writing/submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** POST /api/auth/register — cookie refresh được Set-Cookie */
  register: (body) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** POST /api/auth/login */
  login: (body) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** POST /api/auth/refresh — chỉ cookie, không Bearer */
  refresh: () => request('/auth/refresh', { method: 'POST' }),

  /** POST /api/auth/logout — xoá refresh server + cookie */
  logout: () => request('/auth/logout', { method: 'POST' }),

  /** GET /api/auth/me — cần Bearer */
  me: () => request('/auth/me'),
}
