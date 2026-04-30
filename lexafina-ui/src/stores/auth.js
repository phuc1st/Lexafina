import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Store xác thực người dùng.
 * - Lưu token + thông tin user vào localStorage để persist qua reload.
 * - Expose: user, token, isLoggedIn, login(), logout()
 */
export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('lexafina:token') || '')
  const user = ref(JSON.parse(localStorage.getItem('lexafina:user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)

  /** Đăng nhập: nhận dữ liệu từ API response và persist */
  function login(userData, accessToken) {
    token.value = accessToken
    user.value = userData
    localStorage.setItem('lexafina:token', accessToken)
    localStorage.setItem('lexafina:user', JSON.stringify(userData))
  }

  /** Đăng xuất: xoá state + localStorage */
  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('lexafina:token')
    localStorage.removeItem('lexafina:user')
  }

  /** Cập nhật thông tin user (sau khi chỉnh profile) */
  function updateUser(partial) {
    user.value = { ...user.value, ...partial }
    localStorage.setItem('lexafina:user', JSON.stringify(user.value))
  }

  return { token, user, isLoggedIn, login, logout, updateUser }
})
