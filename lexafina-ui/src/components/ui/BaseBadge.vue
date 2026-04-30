<script setup>
/**
 * Badge / tag nhỏ cho skill label, status, v.v.
 * - variant: 'blue' | 'green' | 'orange' | 'red' | 'gray' | 'purple'
 * - size: 'sm' | 'md'
 */
defineProps({
  variant: { type: String, default: 'gray' },
  size:    { type: String, default: 'md' },
  dot:     { type: Boolean, default: false },
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 font-semibold rounded-full',
      size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-2.5 py-1 text-xs',
      variant === 'blue'   && 'bg-brand-100 text-brand-700',
      variant === 'green'  && 'bg-emerald-100 text-emerald-700',
      variant === 'orange' && 'bg-accent-100 text-accent-600',
      variant === 'red'    && 'bg-red-100 text-red-700',
      variant === 'gray'   && 'bg-slate-100 text-slate-600',
      variant === 'purple' && 'bg-purple-100 text-purple-700',
      variant === 'indigo' && 'bg-indigo-100 text-indigo-700',
    ]"
  >
    <span
      v-if="dot"
      :class="[
        'w-1.5 h-1.5 rounded-full',
        variant === 'blue'   && 'bg-brand-600',
        variant === 'green'  && 'bg-emerald-500',
        variant === 'orange' && 'bg-accent-500',
        variant === 'red'    && 'bg-red-500',
        variant === 'gray'   && 'bg-slate-400',
        variant === 'purple' && 'bg-purple-500',
      ]"
    />
    <slot />
  </span>
</template>
