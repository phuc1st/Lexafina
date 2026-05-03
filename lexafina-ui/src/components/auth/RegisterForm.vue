<script setup>
import { reactive, ref, computed } from 'vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})
const submitted = ref(false)
const showPass = ref(false)
const showPass2 = ref(false)

const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

const usernameError = computed(() => {
  if (!submitted.value) return ''
  const u = form.username.trim()
  if (!u) return 'Nhập tên hiển thị'
  if (u.length < 3) return 'Tối thiểu 3 ký tự'
  return ''
})

const emailError = computed(() => {
  if (!submitted.value) return ''
  const e = form.email.trim()
  if (!e) return 'Nhập email'
  if (!isValidEmail(e)) return 'Email không hợp lệ'
  return ''
})

const passwordError = computed(() => {
  if (!submitted.value) return ''
  if (!form.password) return 'Nhập mật khẩu'
  if (form.password.length < 8) return 'Tối thiểu 8 ký tự'
  return ''
})

const confirmError = computed(() => {
  if (!submitted.value) return ''
  if (form.password !== form.confirmPassword) return 'Mật khẩu xác nhận không khớp'
  return ''
})

const canSubmit = computed(
  () =>
    form.username.trim().length >= 3 &&
    isValidEmail(form.email.trim()) &&
    form.password.length >= 8 &&
    form.password === form.confirmPassword
)

/**
 * Gửi payload đăng ký lên parent (RegisterView gọi API).
 */
function onSubmit() {
  submitted.value = true
  if (usernameError.value || emailError.value || passwordError.value || confirmError.value) return
  if (!canSubmit.value) return
  emit('submit', {
    username: form.username.trim(),
    email: form.email.trim().toLowerCase(),
    password: form.password,
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <BaseInput
      id="reg-username"
      v-model="form.username"
      label="Tên hiển thị"
      type="text"
      placeholder="ielts_learner"
      :error="usernameError"
    />
    <BaseInput
      id="reg-email"
      v-model="form.email"
      label="Email"
      type="email"
      placeholder="you@example.com"
      :error="emailError"
    />
    <BaseInput
      id="reg-password"
      v-model="form.password"
      label="Mật khẩu"
      :type="showPass ? 'text' : 'password'"
      placeholder="••••••••"
      :error="passwordError"
    >
      <template #suffix>
        <button type="button" class="hover:text-slate-700" @click="showPass = !showPass">
          {{ showPass ? 'Ẩn' : 'Hiện' }}
        </button>
      </template>
    </BaseInput>
    <BaseInput
      id="reg-confirm"
      v-model="form.confirmPassword"
      label="Xác nhận mật khẩu"
      :type="showPass2 ? 'text' : 'password'"
      placeholder="••••••••"
      :error="confirmError"
    >
      <template #suffix>
        <button type="button" class="hover:text-slate-700" @click="showPass2 = !showPass2">
          {{ showPass2 ? 'Ẩn' : 'Hiện' }}
        </button>
      </template>
    </BaseInput>

    <BaseButton type="submit" variant="primary" size="lg" :full="true" :loading="props.loading" class="mt-2">
      Đăng ký
    </BaseButton>
  </form>
</template>
