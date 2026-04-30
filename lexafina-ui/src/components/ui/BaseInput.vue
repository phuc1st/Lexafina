<script setup>
/**
 * Input field có label, error message và icon hỗ trợ.
 * Dùng v-model để binding giá trị.
 */
defineProps({
  label:       { type: String, default: '' },
  placeholder: { type: String, default: '' },
  error:       { type: String, default: '' },
  type:        { type: String, default: 'text' },
  id:          { type: String, default: '' },
  disabled:    { type: Boolean, default: false },
  modelValue:  { type: [String, Number], default: '' },
})

defineEmits(['update:modelValue', 'blur'])
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label
      v-if="label"
      :for="id"
      class="text-sm font-semibold text-slate-700"
    >
      {{ label }}
    </label>

    <div class="relative">
      <!-- Prefix icon slot -->
      <div
        v-if="$slots.prefix"
        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400"
      >
        <slot name="prefix" />
      </div>

      <input
        :id="id"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :value="modelValue"
        :class="[
          'w-full rounded-lg border bg-white text-slate-900 text-sm',
          'placeholder:text-slate-400 transition-all duration-150 outline-none',
          'focus:ring-2 focus:ring-brand-600 focus:border-brand-600',
          'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
          $slots.prefix ? 'pl-9' : 'pl-3',
          $slots.suffix ? 'pr-9' : 'pr-3',
          'py-2',
          error
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
            : 'border-slate-200 hover:border-slate-300',
        ]"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
      />

      <!-- Suffix icon slot -->
      <div
        v-if="$slots.suffix"
        class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400"
      >
        <slot name="suffix" />
      </div>
    </div>

    <p v-if="error" class="text-xs text-red-500 font-medium">{{ error }}</p>
  </div>
</template>
