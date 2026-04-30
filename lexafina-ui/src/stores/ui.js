import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Store UI toàn cục.
 * - sidebarOpen: trạng thái đóng/mở sidebar trên mobile
 * - toast: thông báo popup ngắn hạn
 */
export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(false)

  /** Toast: { id, type: 'success'|'error'|'info', message, duration } */
  const toasts = ref([])
  let _toastId = 0

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function closeSidebar() {
    sidebarOpen.value = false
  }

  /** Hiển thị toast message, tự tắt sau duration ms (mặc định 3500) */
  function showToast(message, type = 'info', duration = 3500) {
    const id = ++_toastId
    toasts.value.push({ id, type, message })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, duration)
  }

  function dismissToast(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { sidebarOpen, toasts, toggleSidebar, closeSidebar, showToast, dismissToast }
})
