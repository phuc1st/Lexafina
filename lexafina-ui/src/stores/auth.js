import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, wireAuthStore } from '../services/api'

const USER_KEY = 'lexafina:user'

/**
 * Chuẩn hoá user từ API (username) sang field `name` dùng cho UI cũ (band mặc định).
 */
function normalizeUser(u) {
  if (!u) return null
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    name: u.name || u.username || u.email,
    band: u.band ?? '6.5',
    targetBand: u.targetBand ?? '7.5',
  }
}

/**
 * Gọi một lần từ main.js sau createPinia() — nối token với lớp api (401 refresh).
 * @param {import('pinia').Store} store
 */
export function connectAuthApi(store) {
  wireAuthStore(store)
}

/**
 * Store xác thực: access token trong memory, user (kèm name/band) persist localStorage.
 */
export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref('')
  const user = ref(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))

  const isLoggedIn = computed(() => !!(accessToken.value && user.value))

  function setAuth({ accessToken: t, user: u }) {
    accessToken.value = t || ''
    user.value = normalizeUser(u)
    if (user.value) {
      localStorage.setItem(USER_KEY, JSON.stringify(user.value))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }

  function clearSession() {
    accessToken.value = ''
    user.value = null
    localStorage.removeItem(USER_KEY)
  }

  /**
   * Khôi phục session: refresh cookie → access + user.
   */
  async function bootstrap() {
    try {
      const data = await api.refresh()
      if (data?.accessToken && data?.user) {
        setAuth({ accessToken: data.accessToken, user: data.user })
      }
    } catch {
      clearSession()
    }
  }

  async function logout() {
    try {
      await api.logout()
    } catch {
      /* vẫn xoá local */
    }
    clearSession()
  }

  function updateUser(partial) {
    user.value = { ...user.value, ...partial }
    if (user.value) {
      localStorage.setItem(USER_KEY, JSON.stringify(user.value))
    }
  }

  return {
    accessToken,
    user,
    isLoggedIn,
    setAuth,
    clearSession,
    bootstrap,
    logout,
    updateUser,
  }
})
