<script setup>
/**
 * Card container tái sử dụng.
 * - padding: 'sm' | 'md' | 'lg' | 'none'
 * - hover: hiệu ứng lift khi hover
 */
defineProps({
  padding: { type: String, default: 'md' },
  hover:   { type: Boolean, default: false },
  border:  { type: Boolean, default: true },
})
</script>

<template>
  <div
    :class="[
      'bg-white rounded-xl',
      border ? 'border border-slate-200' : '',
      padding === 'none' && 'p-0',
      padding === 'sm'   && 'p-4',
      padding === 'md'   && 'p-5',
      padding === 'lg'   && 'p-6',
      hover && 'transition-all duration-200 hover:shadow-card-md hover:-translate-y-0.5 cursor-pointer',
      !hover && 'shadow-card',
    ]"
  >
    <slot />
  </div>
</template>
