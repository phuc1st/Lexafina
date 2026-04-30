<script setup>
import { reactive, ref, computed } from 'vue'

const form = reactive({
  email: "",
  password : "",
  remember : false
})

const emailBlurred = ref(false)
const submitted = ref(false)

const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

const emailError = computed(() => {
  const e = form.email.trim()
  const shouldShow = emailBlurred.value || submitted.value
  if (!shouldShow) return ''
  if (!e) return 'Nhập email'
  if (!isValidEmail(e)) return 'Email không hợp lệ'
  return ''
})

const canSubmit = computed(() => {
  return form.email.trim() !== '' && form.password.trim() !== ''
})

const onSubmit = () => {
  submitted.value = true
  if (emailError.value) return
  console.log('Login payload:', {
    email: form.email.trim(),
    password: form.password,
    remember: form.remember,
  })
  
}
</script>

<template>
  <main class="login-page">
    <section class="login-card">
      <h1>Lexafina IELTS</h1>
      <p>Đăng nhập để tiếp tục làm bài Reading/Listening.</p>

      <form class="login-form" @submit.prevent="onSubmit">
      <label for="email">Email</label>
       <input id = "email" v-model = "form.email" type="email" placeholder="you@example.com" autocomplete="email" :class="{ 'input-error': emailError }" :aria-invalid="!!emailError" :aria-describedby="emailError ? 'email-error' : undefined" @blur="emailBlurred = true">
      <label for="password">Mật khẩu</label>
      <input id="password" v-model = "form.password">
      <button type="submit">Đăng nhập</button>
       
      </form>
    </section>
  </main>
</template>
