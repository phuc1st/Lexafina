<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout  from '../layouts/AppLayout.vue'
import BaseCard   from '../components/ui/BaseCard.vue'
import BaseBadge  from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth   = useAuthStore()

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Chào buổi sáng'
  if (h < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
})

// Fake stats — thay bằng API sau
const stats = [
  { label: 'Band hiện tại',  value: auth.user?.band || '6.5', sub: 'Mục tiêu: 7.5', color: 'orange', icon: 'target' },
  { label: 'Bài đã làm',     value: '47',    sub: 'Tuần này +3',          color: 'blue',   icon: 'check' },
  { label: 'Streak hiện tại', value: '12',   sub: 'Ngày liên tiếp',       color: 'green',  icon: 'flame' },
  { label: 'Điểm trung bình', value: '74%',  sub: 'Tăng +2% tuần qua',   color: 'purple', icon: 'trend' },
]

const skillProgress = [
  { name: 'Reading',   icon: 'book',  band: '7.0', percent: 75, color: 'bg-brand-500',   badge: 'blue' },
  { name: 'Listening', icon: 'ear',   band: '6.5', percent: 62, color: 'bg-emerald-500', badge: 'green' },
  { name: 'Writing',   icon: 'pen',   band: '—',   percent: 0,  color: 'bg-slate-200',   badge: 'gray', soon: true },
  { name: 'Speaking',  icon: 'voice', band: '—',   percent: 0,  color: 'bg-slate-200',   badge: 'gray', soon: true },
]

const recentPractice = [
  { id: 1, title: 'Orange Test 20 – Reading Test 1', skill: 'Reading', score: '34/40', band: '7.0', date: 'Hôm nay',     correct: 85 },
  { id: 2, title: 'Orange Test 19 – Listening Part 2', skill: 'Listening', score: '9/10',  band: '8.0', date: 'Hôm qua', correct: 90 },
  { id: 3, title: 'Orange Test 18 – Reading Test 3', skill: 'Reading', score: '28/40', band: '6.5', date: '3 ngày trước', correct: 70 },
]

const weakTopics = [
  { name: 'Matching Headings',     skill: 'Reading',   accuracy: 48, tip: 'Đọc kỹ heading trước khi scan đoạn văn' },
  { name: 'Form Completion',       skill: 'Listening', accuracy: 52, tip: 'Chú ý giới hạn số từ trong đề bài' },
  { name: 'True/False/Not Given',  skill: 'Reading',   accuracy: 55, tip: 'Phân biệt False và Not Given' },
]

const ICON_PATHS = {
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  check:  '<polyline points="20 6 9 17 4 12"/>',
  flame:  '<path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/>',
  trend:  '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  book:   '<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>',
  ear:    '<path d="M6 8.5a6.5 6.5 0 1113 0c0 6-6 6-6 10a3.5 3.5 0 01-7 0"/><path d="M15 8.5a2.5 2.5 0 00-5 0v1a2 2 0 105 0v-1z"/>',
  pen:    '<line x1="18" y1="2" x2="22" y2="6"/><path d="M7.5 20.5L19 9l-4-4L3.5 16.5 2 22z"/>',
  voice:  '<path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>',
}

const statColors = {
  orange: { bg: 'bg-accent-50',  icon: 'text-accent-500',  border: 'border-accent-100' },
  blue:   { bg: 'bg-brand-50',   icon: 'text-brand-600',   border: 'border-brand-100' },
  green:  { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
  purple: { bg: 'bg-purple-50',  icon: 'text-purple-600',  border: 'border-purple-100' },
}

function goToPractice(skill) {
  router.push({ name: 'practice-list', params: { skill: skill.toLowerCase() } })
}
</script>

<template>
  <AppLayout title="Dashboard">
    <!-- Greeting banner -->
    <div class="mb-6 flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">
          {{ greeting }}, {{ auth.user?.name?.split(' ').pop() || 'bạn' }}! 👋
        </h2>
        <p class="text-sm text-slate-500 mt-1">Hãy cùng luyện tập để đạt band mục tiêu nhé.</p>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton variant="secondary" size="sm" @click="goToPractice('reading')">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="ICON_PATHS.book" />
          Làm bài Reading
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="goToPractice('listening')">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="ICON_PATHS.ear" />
          Làm bài Listening
        </BaseButton>
      </div>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <BaseCard
        v-for="stat in stats"
        :key="stat.label"
        padding="md"
        :class="['border', statColors[stat.color].border]"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs text-slate-500 font-medium mb-1.5">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-slate-900">{{ stat.value }}</p>
            <p class="text-xs text-slate-400 mt-1">{{ stat.sub }}</p>
          </div>
          <div :class="['w-9 h-9 rounded-lg flex items-center justify-center shrink-0', statColors[stat.color].bg]">
            <svg
              :class="['w-4.5 h-4.5', statColors[stat.color].icon]"
              style="width:18px;height:18px"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              v-html="ICON_PATHS[stat.icon]"
            />
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Main grid: 2 cols -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <!-- Skill Progress — 2 cols wide -->
      <div class="xl:col-span-2 space-y-5">
        <!-- Skill cards -->
        <BaseCard padding="md">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-slate-800">Tiến độ kỹ năng</h3>
            <BaseBadge variant="blue">Phase 1</BaseBadge>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              v-for="skill in skillProgress"
              :key="skill.name"
              :class="[
                'rounded-xl p-4 text-left border transition-all duration-200',
                skill.soon
                  ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                  : 'border-slate-200 hover:border-brand-300 hover:shadow-card-md hover:-translate-y-0.5 cursor-pointer',
              ]"
              :disabled="skill.soon"
              @click="!skill.soon && goToPractice(skill.name)"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="text-lg">
                  {{ skill.name === 'Reading' ? '📖' : skill.name === 'Listening' ? '🎧' : skill.name === 'Writing' ? '✏️' : '🎤' }}
                </span>
                <BaseBadge :variant="skill.badge" size="sm">
                  {{ skill.soon ? 'Soon' : skill.band }}
                </BaseBadge>
              </div>
              <p class="text-sm font-semibold text-slate-800">{{ skill.name }}</p>

              <!-- Progress bar -->
              <div class="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  :class="['h-full rounded-full transition-all duration-500', skill.color]"
                  :style="{ width: skill.percent + '%' }"
                />
              </div>
              <p class="text-xs text-slate-400 mt-1">{{ skill.percent }}%</p>
            </button>
          </div>
        </BaseCard>

        <!-- Lịch sử gần đây -->
        <BaseCard padding="md">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-slate-800">Lịch sử làm bài gần đây</h3>
            <RouterLink
              :to="{ name: 'history' }"
              class="text-xs text-brand-600 hover:text-brand-700 font-semibold"
            >
              Xem tất cả →
            </RouterLink>
          </div>

          <div class="space-y-2">
            <div
              v-for="item in recentPractice"
              :key="item.id"
              class="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all cursor-pointer group"
            >
              <!-- Icon -->
              <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                :class="item.skill === 'Reading' ? 'bg-brand-100' : 'bg-emerald-100'"
              >
                <span>{{ item.skill === 'Reading' ? '📖' : '🎧' }}</span>
              </div>

              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-800 truncate group-hover:text-brand-700 transition-colors">
                  {{ item.title }}
                </p>
                <p class="text-xs text-slate-400 mt-0.5">{{ item.date }}</p>
              </div>

              <div class="text-right shrink-0">
                <p class="text-sm font-bold text-slate-800">{{ item.score }}</p>
                <p class="text-xs font-semibold" :class="parseFloat(item.band) >= 7 ? 'text-emerald-600' : 'text-accent-600'">
                  Band {{ item.band }}
                </p>
              </div>
            </div>

            <div v-if="!recentPractice.length" class="py-8 text-center text-slate-400 text-sm">
              Chưa có lịch sử làm bài. Hãy thử ngay!
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Right column -->
      <div class="space-y-5">
        <!-- Daily streak -->
        <BaseCard padding="md" class="bg-gradient-to-br from-accent-500 to-accent-600 border-0 text-white">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm font-semibold opacity-90">Daily Streak</p>
            <span class="text-2xl">🔥</span>
          </div>
          <p class="text-4xl font-black">12</p>
          <p class="text-sm opacity-80 mt-1">ngày liên tiếp</p>
          <div class="mt-4 flex gap-1.5">
            <div v-for="i in 7" :key="i" :class="['flex-1 h-1.5 rounded-full', i <= 5 ? 'bg-white' : 'bg-white/30']" />
          </div>
          <p class="text-xs opacity-70 mt-2">5/7 ngày trong tuần này</p>
        </BaseCard>

        <!-- Target band -->
        <BaseCard padding="md">
          <h3 class="text-sm font-semibold text-slate-800 mb-3">Mục tiêu Band</h3>
          <div class="flex items-end gap-3">
            <div class="text-center">
              <p class="text-3xl font-black text-accent-500">{{ auth.user?.band || '6.5' }}</p>
              <p class="text-xs text-slate-400">Hiện tại</p>
            </div>
            <div class="flex-1 flex items-center justify-center">
              <svg class="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
            <div class="text-center">
              <p class="text-3xl font-black text-brand-600">7.5</p>
              <p class="text-xs text-slate-400">Mục tiêu</p>
            </div>
          </div>
          <div class="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-accent-500 to-brand-600" style="width: 60%" />
          </div>
          <p class="text-xs text-slate-400 mt-2 text-center">60% trên lộ trình</p>
        </BaseCard>

        <!-- Điểm yếu cần cải thiện -->
        <BaseCard padding="md">
          <h3 class="text-sm font-semibold text-slate-800 mb-3">Cần cải thiện</h3>
          <div class="space-y-3">
            <div v-for="w in weakTopics" :key="w.name" class="space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-slate-700">{{ w.name }}</span>
                <span class="text-xs font-bold" :class="w.accuracy < 55 ? 'text-red-500' : 'text-amber-500'">
                  {{ w.accuracy }}%
                </span>
              </div>
              <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full"
                  :class="w.accuracy < 55 ? 'bg-red-400' : 'bg-amber-400'"
                  :style="{ width: w.accuracy + '%' }"
                />
              </div>
              <p class="text-xs text-slate-400 leading-snug">{{ w.tip }}</p>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </AppLayout>
</template>
