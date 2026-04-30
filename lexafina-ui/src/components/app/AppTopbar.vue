<script setup>
import { useUiStore } from '../../stores/ui'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

defineProps({
  title: { type: String, default: '' },
})

const ui   = useUiStore()
const auth = useAuthStore()
const router = useRouter()
</script>

<template>
  <header
    class="fixed top-0 left-0 lg:left-sidebar right-0 h-topbar bg-white border-b border-slate-200 z-20 flex items-center gap-3 px-4 lg:px-6"
  >
    <!-- Hamburger mobile -->
    <button
      class="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
      @click="ui.toggleSidebar()"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>

    <!-- Title -->
    <h1 class="text-base font-semibold text-slate-800 flex-1 truncate">{{ title }}</h1>

    <!-- Right actions -->
    <div class="flex items-center gap-2">
      <!-- Notification bell placeholder -->
      <button class="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
        <svg class="w-4.5 h-4.5" style="width:18px;height:18px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        <!-- Notification dot -->
        <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
      </button>

      <!-- Avatar -->
      <RouterLink :to="{ name: 'profile' }" class="block">
        <div class="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold hover:ring-2 hover:ring-brand-300 transition-all">
          {{ auth.user?.name?.charAt(0)?.toUpperCase() || 'U' }}
        </div>
      </RouterLink>
    </div>
  </header>
</template>
