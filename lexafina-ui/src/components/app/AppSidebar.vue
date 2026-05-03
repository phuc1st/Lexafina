<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useUiStore } from '../../stores/ui'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()
const ui     = useUiStore()

/** SVG path cho mỗi icon nav */
const ICON_PATHS = {
  grid:        '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  'book-open': '<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>',
  headphones:  '<path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z"/><path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>',
  edit:        '<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  mic:         '<path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',
  'bar-chart': '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  user:        '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>',
}

const navItems = [
  { name: 'Dashboard',   to: { name: 'dashboard' },                                     icon: 'grid' },
  { name: 'Reading',     to: { name: 'practice-list', params: { skill: 'reading' } },   icon: 'book-open' },
  { name: 'Listening',   to: { name: 'practice-list', params: { skill: 'listening' } }, icon: 'headphones' },
  { name: 'Writing',     to: { name: 'practice-list', params: { skill: 'writing' } },   icon: 'edit' },
  { name: 'Speaking',    to: { name: 'practice-list', params: { skill: 'speaking' } },  icon: 'mic' },
  { name: 'Kết quả',     to: { name: 'history' },    icon: 'bar-chart',   soon: true },
]

const accountItems = [
  { name: 'Hồ sơ', to: { name: 'profile' }, icon: 'user' },
]

function isActive(item) {
  if (item.to?.name === 'practice-list') {
    const skill = item.to.params?.skill
    if (route.name === 'practice-list') {
      return route.params?.skill === skill
    }
    if (route.name === 'writing-practice') return skill === 'writing'
    if (route.name === 'speaking-practice') return skill === 'speaking'
    if (route.name === 'reading') return skill === 'reading'
    if (route.name === 'listening') return skill === 'listening'
    return false
  }
  return route.name === item.to?.name
}

function navigate(item) {
  if (item.soon) return
  router.push(item.to)
  ui.closeSidebar()
}

async function logout() {
  await auth.logout()
  router.push({ name: 'login' })
}

const userInitials = computed(() => {
  const name = auth.user?.name || auth.user?.email || 'U'
  return name.charAt(0).toUpperCase()
})
</script>

<template>
  <!-- Backdrop mobile -->
  <Transition name="fade">
    <div
      v-if="ui.sidebarOpen"
      class="fixed inset-0 bg-black/50 z-30 lg:hidden"
      @click="ui.closeSidebar()"
    />
  </Transition>

  <aside
    :class="[
      'fixed top-0 left-0 h-full w-sidebar bg-sidebar flex flex-col z-40',
      'transition-transform duration-300 ease-in-out',
      ui.sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center gap-2.5 px-5 h-topbar border-b border-sidebar-border shrink-0">
      <div class="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
        <span class="text-white font-black text-sm leading-none">L</span>
      </div>
      <div>
        <div class="text-white font-bold text-base leading-none tracking-tight">Lexafina</div>
        <div class="text-sidebar-text text-2xs leading-none mt-0.5">IELTS Practice</div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 scrollbar-thin">
      <!-- Practice section -->
      <p class="px-5 mb-1 text-2xs font-semibold text-slate-500 uppercase tracking-wider">Luyện tập</p>
      <ul class="space-y-0.5 px-3 mb-4">
        <li v-for="item in navItems" :key="item.name">
          <button
            :class="[
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 text-left',
              isActive(item) ? 'bg-sidebar-active text-white' : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white',
              item.soon && 'opacity-40 cursor-not-allowed',
            ]"
            @click="navigate(item)"
          >
            <svg
              class="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              v-html="ICON_PATHS[item.icon]"
            />
            <span class="flex-1">{{ item.name }}</span>
            <span v-if="item.soon" class="text-2xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full">Soon</span>
          </button>
        </li>
      </ul>

      <!-- Account section -->
      <p class="px-5 mb-1 text-2xs font-semibold text-slate-500 uppercase tracking-wider">Tài khoản</p>
      <ul class="space-y-0.5 px-3">
        <li v-for="item in accountItems" :key="item.name">
          <button
            :class="[
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 text-left',
              isActive(item) ? 'bg-sidebar-active text-white' : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white',
            ]"
            @click="navigate(item)"
          >
            <svg
              class="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              v-html="ICON_PATHS[item.icon]"
            />
            <span>{{ item.name }}</span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- User footer -->
    <div class="border-t border-sidebar-border p-3 shrink-0">
      <div class="flex items-center gap-3 px-2 py-2 rounded-lg group hover:bg-sidebar-hover transition-colors cursor-default">
        <div class="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {{ userInitials }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-white text-sm font-semibold truncate leading-tight">{{ auth.user?.name || 'Người dùng' }}</p>
          <p class="text-sidebar-text text-xs truncate mt-0.5">{{ auth.user?.email || '' }}</p>
        </div>
        <button
          class="opacity-0 group-hover:opacity-100 transition-opacity text-sidebar-text hover:text-red-400 p-1 rounded"
          title="Đăng xuất"
          @click="logout"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
