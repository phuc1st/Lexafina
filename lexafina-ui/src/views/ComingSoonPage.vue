<script setup>
import { useRoute } from 'vue-router'
import AppLayout  from '../layouts/AppLayout.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { useRouter } from 'vue-router'

const route  = useRoute()
const router = useRouter()

const pageInfo = {
  writing:  { emoji: '✏️', label: 'Writing Practice', desc: 'Luyện tập Writing Task 1 & 2 với phân tích chi tiết và feedback từ AI.' },
  speaking: { emoji: '🎤', label: 'Speaking Practice', desc: 'Luyện tập Speaking theo từng Part, nhận feedback phát âm và ngữ pháp.' },
  history:  { emoji: '📊', label: 'Lịch sử làm bài', desc: 'Xem lại toàn bộ lịch sử, phân tích xu hướng và điểm yếu qua các bài làm.' },
}

const info = pageInfo[route.name] || { emoji: '🚀', label: route.name, desc: 'Tính năng đang được phát triển.' }
</script>

<template>
  <AppLayout :title="info.label">
    <div class="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <!-- Illustration -->
      <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-5xl mb-6 shadow-card-md">
        {{ info.emoji }}
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mb-2">{{ info.label }}</h2>
      <p class="text-sm text-slate-500 max-w-sm mb-2">{{ info.desc }}</p>
      <p class="text-sm font-semibold text-brand-600 mb-8">
        🚀 Đang phát triển — sẽ có mặt sớm!
      </p>

      <!-- Phase badge -->
      <div class="flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-4 py-2 mb-8">
        <span class="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
        <span class="text-xs font-semibold text-brand-700">Phase 2 Roadmap</span>
      </div>

      <BaseButton variant="secondary" @click="router.push({ name: 'dashboard' })">
        ← Về Dashboard
      </BaseButton>
    </div>
  </AppLayout>
</template>
