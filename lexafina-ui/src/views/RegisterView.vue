<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '../layouts/AuthLayout.vue'
import RegisterForm from '../components/auth/RegisterForm.vue'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'
import { api } from '../services/api'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const loading = ref(false)

async function onRegister(payload) {
  loading.value = true
  try {
    const data = await api.register(payload)
    auth.setAuth({ accessToken: data.accessToken, user: data.user })
    ui.showToast('Đăng ký thành công!', 'success')
    router.push({ name: 'dashboard' })
  } catch (e) {
    ui.showToast(e?.message || 'Đăng ký thất bại', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div class="animate-fade-in">
      <div class="mb-7">
        <h1 class="text-2xl font-bold text-slate-900 mb-1.5">Tạo tài khoản</h1>
        <p class="text-sm text-slate-500">Tham gia Lexafina và bắt đầu luyện IELTS có lộ trình.</p>
      </div>

      <RegisterForm :loading="loading" @submit="onRegister" />

      <p class="text-center text-sm text-slate-500 mt-6">
        Đã có tài khoản?
        <router-link :to="{ name: 'login' }" class="text-brand-600 font-semibold hover:underline">
          Đăng nhập
        </router-link>
      </p>
    </div>
  </AuthLayout>
</template>
