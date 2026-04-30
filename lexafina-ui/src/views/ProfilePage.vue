<script setup>
import { reactive, ref } from 'vue'
import AppLayout  from '../layouts/AppLayout.vue'
import BaseCard   from '../components/ui/BaseCard.vue'
import BaseInput  from '../components/ui/BaseInput.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseBadge  from '../components/ui/BaseBadge.vue'
import { useAuthStore } from '../stores/auth'
import { useUiStore }   from '../stores/ui'

const auth = useAuthStore()
const ui   = useUiStore()

const saving = ref(false)

const form = reactive({
  name:        auth.user?.name || '',
  email:       auth.user?.email || '',
  targetBand:  auth.user?.targetBand || '7.5',
  currentBand: auth.user?.band || '6.5',
})

const achievements = [
  { icon: '🔥', label: '7 ngày streak',   desc: 'Luyện tập 7 ngày liên tiếp',    earned: true },
  { icon: '📖', label: '50 bài Reading',   desc: 'Hoàn thành 50 bài Reading',     earned: true },
  { icon: '🎧', label: '20 bài Listening', desc: 'Hoàn thành 20 bài Listening',   earned: false },
  { icon: '🏆', label: 'Band 7.0+',        desc: 'Đạt band 7.0 lần đầu tiên',     earned: false },
  { icon: '⚡', label: 'Speed Runner',      desc: 'Hoàn thành bài dưới 30 phút',   earned: false },
  { icon: '🎯', label: 'Perfect Score',    desc: 'Đạt 40/40 câu đúng',            earned: false },
]

const stats = [
  { label: 'Tổng bài đã làm',   value: '47' },
  { label: 'Reading đã làm',    value: '28' },
  { label: 'Listening đã làm',  value: '19' },
  { label: 'Thời gian luyện tập', value: '32h' },
]

async function saveProfile() {
  saving.value = true
  await new Promise((r) => setTimeout(r, 700))
  auth.updateUser({
    name: form.name,
    band: form.currentBand,
    targetBand: form.targetBand,
  })
  ui.showToast('Đã lưu hồ sơ thành công!', 'success')
  saving.value = false
}

const userInitials = (name) => (name || 'U').charAt(0).toUpperCase()
</script>

<template>
  <AppLayout title="Hồ sơ">
    <div class="max-w-4xl mx-auto space-y-6">

      <!-- Profile header card -->
      <BaseCard padding="lg">
        <div class="flex items-start gap-5 flex-wrap">
          <!-- Avatar -->
          <div class="relative">
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-3xl font-black shadow-card-md">
              {{ userInitials(auth.user?.name) }}
            </div>
            <button class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-brand-600 transition-colors">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>

          <div class="flex-1 min-w-0">
            <h2 class="text-xl font-bold text-slate-900">{{ auth.user?.name || 'Người dùng' }}</h2>
            <p class="text-sm text-slate-500 mt-0.5">{{ auth.user?.email }}</p>
            <div class="flex items-center gap-2 mt-2">
              <BaseBadge variant="orange" dot>Band {{ auth.user?.band || '6.5' }}</BaseBadge>
              <BaseBadge variant="blue">Mục tiêu {{ form.targetBand }}</BaseBadge>
            </div>
          </div>

          <!-- Mini stats -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto">
            <div v-for="s in stats" :key="s.label" class="text-center px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
              <p class="text-lg font-bold text-slate-900">{{ s.value }}</p>
              <p class="text-xs text-slate-500 mt-0.5">{{ s.label }}</p>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- 2-col grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Edit profile form -->
        <div class="lg:col-span-2">
          <BaseCard padding="lg">
            <h3 class="text-base font-semibold text-slate-800 mb-5">Thông tin cá nhân</h3>
            <form class="space-y-4" @submit.prevent="saveProfile">
              <BaseInput
                id="name"
                v-model="form.name"
                label="Họ và tên"
                placeholder="Nguyễn Văn A"
              />
              <BaseInput
                id="email"
                v-model="form.email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                :disabled="true"
              />

              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-semibold text-slate-700">Band hiện tại</label>
                  <select
                    v-model="form.currentBand"
                    class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
                  >
                    <option v-for="b in ['4.0','4.5','5.0','5.5','6.0','6.5','7.0','7.5','8.0','8.5','9.0']" :key="b" :value="b">
                      Band {{ b }}
                    </option>
                  </select>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-semibold text-slate-700">Band mục tiêu</label>
                  <select
                    v-model="form.targetBand"
                    class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
                  >
                    <option v-for="b in ['5.0','5.5','6.0','6.5','7.0','7.5','8.0','8.5','9.0']" :key="b" :value="b">
                      Band {{ b }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="flex justify-end pt-2">
                <BaseButton type="submit" variant="primary" :loading="saving">
                  Lưu thay đổi
                </BaseButton>
              </div>
            </form>
          </BaseCard>
        </div>

        <!-- Achievements -->
        <BaseCard padding="lg">
          <h3 class="text-base font-semibold text-slate-800 mb-4">Thành tích</h3>
          <div class="space-y-3">
            <div
              v-for="a in achievements"
              :key="a.label"
              :class="[
                'flex items-center gap-3 p-3 rounded-lg border transition-all',
                a.earned
                  ? 'border-accent-200 bg-accent-50'
                  : 'border-slate-100 bg-slate-50 opacity-50',
              ]"
            >
              <span class="text-xl">{{ a.icon }}</span>
              <div class="min-w-0">
                <p class="text-xs font-bold text-slate-800">{{ a.label }}</p>
                <p class="text-xs text-slate-500 truncate">{{ a.desc }}</p>
              </div>
              <div v-if="a.earned" class="shrink-0">
                <svg class="w-4 h-4 text-accent-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Danger zone -->
      <BaseCard padding="md" class="border-red-100">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p class="text-sm font-semibold text-slate-800">Xoá tài khoản</p>
            <p class="text-xs text-slate-500 mt-0.5">Hành động này không thể hoàn tác. Tất cả dữ liệu sẽ bị xoá vĩnh viễn.</p>
          </div>
          <BaseButton variant="danger" size="sm">Xoá tài khoản</BaseButton>
        </div>
      </BaseCard>
    </div>
  </AppLayout>
</template>
