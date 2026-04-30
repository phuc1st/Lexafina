<script setup>
/**
 * Button tái sử dụng với 4 variants và 3 sizes.
 * - variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 * - size: 'sm' | 'md' | 'lg'
 * - loading: hiện spinner, disable interaction
 */
defineProps({
  variant: { type: String, default: 'primary' },
  size:    { type: String, default: 'md' },
  loading: { type: Boolean, default: false },
  disabled:{ type: Boolean, default: false },
  type:    { type: String, default: 'button' },
  full:    { type: Boolean, default: false },
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 outline-none',
      'focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      full ? 'w-full' : '',
      // Sizes
      size === 'sm' && 'h-8 px-3 text-xs',
      size === 'md' && 'h-9 px-4 text-sm',
      size === 'lg' && 'h-11 px-6 text-md',
      // Variants
      variant === 'primary' && 'bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98]',
      variant === 'secondary' && 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200',
      variant === 'ghost' && 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
      variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
      variant === 'accent' && 'bg-accent-500 text-white hover:bg-accent-600 active:scale-[0.98]',
      variant === 'outline' && 'border border-slate-200 text-slate-700 hover:bg-slate-50 bg-white',
    ]"
  >
    <!-- Spinner khi loading -->
    <svg
      v-if="loading"
      class="animate-spin shrink-0"
      :class="size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>

    <slot />
  </button>
</template>
