<script setup>
import { useUiStore } from '../../stores/ui'
const ui = useUiStore()
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 w-80">
      <TransitionGroup name="toast">
        <div
          v-for="toast in ui.toasts"
          :key="toast.id"
          :class="[
            'flex items-start gap-3 px-4 py-3 rounded-xl shadow-card-lg text-sm font-medium',
            toast.type === 'success' && 'bg-emerald-600 text-white',
            toast.type === 'error'   && 'bg-red-600 text-white',
            toast.type === 'info'    && 'bg-slate-800 text-white',
          ]"
        >
          <span class="text-base leading-none mt-0.5">
            {{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ' }}
          </span>
          <span class="flex-1">{{ toast.message }}</span>
          <button
            class="opacity-70 hover:opacity-100 transition-opacity ml-1 text-base leading-none"
            @click="ui.dismissToast(toast.id)"
          >×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active  { transition: all 0.25s ease; }
.toast-leave-active  { transition: all 0.2s ease; }
.toast-enter-from    { opacity: 0; transform: translateY(12px); }
.toast-leave-to      { opacity: 0; transform: translateX(100%); }
</style>
