<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout  from '../layouts/AuthLayout.vue'
import BaseButton  from '../components/ui/BaseButton.vue'
import BaseInput   from '../components/ui/BaseInput.vue'
import { useAuthStore } from '../stores/auth'
import { useUiStore }   from '../stores/ui'
import { api } from '../services/api'

const router = useRouter()
const auth   = useAuthStore()
const ui     = useUiStore()

const form = reactive({ email: '', password: '', remember: false })
const loading     = ref(false)
const showPass    = ref(false)
const emailBlurred = ref(false)
const submitted    = ref(false)

const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

const emailError = computed(() => {
  if (!emailBlurred.value && !submitted.value) return ''
  const e = form.email.trim()
  if (!e) return 'Vui lòng nhập email'
  if (!isValidEmail(e)) return 'Email không hợp lệ'
  return ''
})

const canSubmit = computed(() => form.email.trim() && form.password.trim())

async function onSubmit() {
  submitted.value = true
  if (emailError.value || !canSubmit.value) return

  loading.value = true
  try {
    const data = await api.login({
      email: form.email.trim(),
      password: form.password,
    })
    auth.setAuth({ accessToken: data.accessToken, user: data.user })
    ui.showToast('Đăng nhập thành công!', 'success')
    router.push({ name: 'dashboard' })
  } catch (err) {
    ui.showToast(err.message || 'Đăng nhập thất bại', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="mb-7">
        <h1 class="text-2xl font-bold text-slate-900 mb-1.5">Đăng nhập</h1>
        <p class="text-sm text-slate-500">Chào mừng trở lại! Tiếp tục hành trình IELTS của bạn.</p>
      </div>

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="onSubmit">
        <BaseInput
          id="email"
          v-model="form.email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          :error="emailError"
          @blur="emailBlurred = true"
        >
          <template #prefix>
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
          </template>
        </BaseInput>

        <BaseInput
          id="password"
          v-model="form.password"
          label="Mật khẩu"
          :type="showPass ? 'text' : 'password'"
          placeholder="••••••••"
        >
          <template #prefix>
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </template>
          <template #suffix>
            <button type="button" class="hover:text-slate-700 transition-colors" @click="showPass = !showPass">
              <svg v-if="showPass" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </template>
        </BaseInput>

        <!-- Remember + Forgot -->
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input
              v-model="form.remember"
              type="checkbox"
              class="w-4 h-4 rounded border-slate-300 text-brand-600 accent-brand-600"
            />
            <span class="text-sm text-slate-600">Ghi nhớ đăng nhập</span>
          </label>
          <a href="#" class="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">
            Quên mật khẩu?
          </a>
        </div>

        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          :full="true"
          :loading="loading"
          :disabled="!canSubmit"
          class="mt-2"
        >
          Đăng nhập
        </BaseButton>
      </form>

      <!-- Divider -->
      <div class="flex items-center gap-3 my-5">
        <div class="flex-1 h-px bg-slate-200" />
        <span class="text-xs text-slate-400 font-medium">hoặc</span>
        <div class="flex-1 h-px bg-slate-200" />
      </div>

      <!-- Google SSO placeholder -->
      <BaseButton variant="outline" size="lg" :full="true">
        <svg class="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Tiếp tục với Google
      </BaseButton>

      <!-- Sign up link -->
      <p class="text-center text-sm text-slate-500 mt-6">
        Chưa có tài khoản?
        <router-link :to="{ name: 'register' }" class="text-brand-600 font-semibold hover:underline">
          Đăng ký miễn phí
        </router-link>
      </p>
    </div>
  </AuthLayout>
</template>
