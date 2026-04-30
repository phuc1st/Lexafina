import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../services/api'

const PAGE_SIZE = 16

// Số part hợp lệ theo skill.
export const PARTS_BY_SKILL = {
  reading: [1, 2, 3],
  listening: [1, 2, 3, 4],
  speaking: [1, 2, 3, 23],
  writing: [],
}

/**
 * State + data fetching cho trang list bài luyện.
 * - URL query là source of truth → refresh/bookmark giữ filter.
 * - Filter changes (skill/mode/part/taskType) tự reset page về 1 ở setter.
 * - Keyword là client-side filter, không gọi lại API.
 *
 * Status (Bài chưa làm/đã làm) hiện chỉ là UI placeholder; sau này có auth
 * sẽ join với progress của user — TODO khi triển khai user system.
 */
export function useQuizListing() {
  const route = useRoute()
  const router = useRouter()

  const skill = ref(normalizeSkill(route.params.skill))
  const mode = ref(normalizeMode(route.query.mode))
  const status = ref(normalizeStatus(route.query.status))
  const selectedPart = ref(parsePart(route.query.part, skill.value))
  const taskType = ref(parseTaskType(route.query.task_type, skill.value))
  const keyword = ref(route.query.q || '')
  const page = ref(parsePage(route.query.page))

  // Guard: writing không hỗ trợ mocktest trong phase hiện tại.
  if (skill.value === 'writing' && mode.value === 'mocktest') {
    mode.value = 'quiz'
  }

  const data = ref({ items: [], total: 0 })
  const loading = ref(false)
  const error = ref(null)

  const totalPages = computed(() =>
    Math.max(1, Math.ceil((data.value.total || 0) / PAGE_SIZE))
  )

  // Client-side filter theo keyword. Hoạt động khác nhau cho 2 mode:
  // - quiz: filter theo title của QuizSummary
  // - mocktest: filter trong từng book.mock_tests, bỏ book rỗng
  const filteredItems = computed(() => {
    const kw = keyword.value.trim().toLowerCase()
    if (!kw) return data.value.items

    if (mode.value === 'quiz') {
      return data.value.items.filter((q) =>
        (q.title || '').toLowerCase().includes(kw)
      )
    }
    return data.value.items
      .map((book) => ({
        ...book,
        mock_tests: (book.mock_tests || []).filter((mt) =>
          (mt.title || '').toLowerCase().includes(kw)
        ),
      }))
      .filter((book) => book.mock_tests.length > 0)
  })

  function buildQuery() {
    const q = { mode: mode.value, status: status.value }
    if (selectedPart.value != null) q.part = selectedPart.value
    if (taskType.value != null) q.task_type = taskType.value
    if (keyword.value.trim()) q.q = keyword.value.trim()
    if (page.value > 1) q.page = page.value
    return q
  }

  function syncUrl() {
    router.replace({
      name: 'practice-list',
      params: { skill: skill.value },
      query: buildQuery(),
    })
  }

  async function fetchData() {
    loading.value = true
    error.value = null
    try {
      let res
      if (mode.value === 'quiz') {
        res = await api.listQuizzes({
          skill: skill.value,
          part: selectedPart.value,
          taskType: taskType.value,
          page: page.value,
          pageSize: PAGE_SIZE,
        })
      } else {
        res = await api.listMockTests({
          skill: skill.value,
          page: page.value,
          pageSize: PAGE_SIZE,
        })
      }
      data.value = { items: res.items || [], total: res.total || 0 }
    } catch (e) {
      error.value = e
      data.value = { items: [], total: 0 }
    } finally {
      loading.value = false
    }
  }

  // Mỗi setter chịu trách nhiệm reset page về 1 — tránh phải watch ngược
  function setSkill(s) {
    if (s === skill.value) return
    skill.value = normalizeSkill(s)
    selectedPart.value = null
    taskType.value = null
    // Writing chỉ hỗ trợ quiz mode.
    if (skill.value === 'writing' && mode.value === 'mocktest') {
      mode.value = 'quiz'
    }
    page.value = 1
  }

  function setMode(m) {
    if (m === mode.value) return
    mode.value = normalizeMode(m)
    if (mode.value === 'mocktest') {
      selectedPart.value = null
      taskType.value = null
    }
    page.value = 1
  }

  function setPart(p) {
    const next = p == null ? null : Number(p)
    const valid = PARTS_BY_SKILL[skill.value] || []
    if (next != null && !valid.includes(next)) return
    if (next === selectedPart.value) return
    selectedPart.value = next
    page.value = 1
  }

  function setTaskType(t) {
    const next = t == null ? null : Number(t)
    if (next != null && next !== 1 && next !== 2) return
    if (next === taskType.value) return
    taskType.value = next
    page.value = 1
  }

  function setStatus(s) {
    status.value = normalizeStatus(s)
  }

  function setKeyword(k) {
    keyword.value = k || ''
  }

  function setPage(p) {
    const n = Math.max(1, Math.min(totalPages.value, Number(p) || 1))
    if (n === page.value) return
    page.value = n
  }

  // Watch các filter có ảnh hưởng tới API call → fetch + sync URL
  watch(
    [skill, mode, selectedPart, taskType, page],
    () => {
      syncUrl()
      fetchData()
    },
    { immediate: true }
  )

  // Watch keyword + status → chỉ sync URL (không fetch)
  watch([keyword, status], () => syncUrl())

  return {
    skill,
    mode,
    status,
    selectedPart,
    taskType,
    keyword,
    page,
    pageSize: PAGE_SIZE,

    data,
    loading,
    error,
    totalPages,
    filteredItems,

    setSkill,
    setMode,
    setPart,
    setTaskType,
    setStatus,
    setKeyword,
    setPage,
    refresh: fetchData,
  }
}

function normalizeSkill(s) {
  if (s === 'listening') return 'listening'
  if (s === 'writing') return 'writing'
  if (s === 'speaking') return 'speaking'
  return 'reading'
}

function normalizeMode(m) {
  return m === 'mocktest' ? 'mocktest' : 'quiz'
}

function normalizeStatus(s) {
  return s === 'finished' ? 'finished' : 'unfinished'
}

function parsePart(raw, skill) {
  if (skill === 'writing') return null
  if (raw == null || raw === '') return null
  const n = Number(raw)
  const valid = PARTS_BY_SKILL[skill] || []
  return valid.includes(n) ? n : null
}

function parseTaskType(raw, skill) {
  if (skill !== 'writing') return null
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return n === 1 || n === 2 ? n : null
}

function parsePage(raw) {
  const n = Number(raw)
  return Number.isFinite(n) && n >= 1 ? n : 1
}
