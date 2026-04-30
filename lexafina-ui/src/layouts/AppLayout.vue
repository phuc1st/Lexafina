<script setup>
/**
 * Layout chính cho toàn bộ app sau khi login.
 * Cấu trúc: Sidebar (fixed trái) + Topbar (fixed trên) + main content area
 * - prop title: tiêu đề hiển thị trên topbar
 */
import AppSidebar from '../components/app/AppSidebar.vue'
import AppTopbar  from '../components/app/AppTopbar.vue'
import ToastContainer from '../components/ui/ToastContainer.vue'

defineProps({
  title: { type: String, default: '' },
})
</script>

<template>
  <div class="min-h-screen bg-surface-muted">
    <AppSidebar />
    <AppTopbar :title="title" />

    <!-- Main content: offset bằng sidebar width + topbar height -->
    <main class="lg:ml-sidebar pt-topbar min-h-screen">
      <div class="p-4 lg:p-6 animate-fade-in">
        <slot />
      </div>
    </main>

    <ToastContainer />
  </div>
</template>
