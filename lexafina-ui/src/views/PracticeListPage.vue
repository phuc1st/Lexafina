<script setup>
import { computed } from 'vue'
import { useQuizListing } from '../composables/useQuizListing'
import AppLayout       from '../layouts/AppLayout.vue'
import BaseBadge       from '../components/ui/BaseBadge.vue'
import BaseButton      from '../components/ui/BaseButton.vue'
import SkeletonCard    from '../components/ui/SkeletonCard.vue'
import QuizCard        from '../components/list/QuizCard.vue'
import BookGroupSection from '../components/list/BookGroupSection.vue'
import PaginationBar   from '../components/list/PaginationBar.vue'
import SearchBar       from '../components/list/SearchBar.vue'
import StatusTabs      from '../components/list/StatusTabs.vue'

const {
  skill, mode, status, selectedPart, taskType, keyword, page,
  loading, error, totalPages, filteredItems,
  setSkill, setMode, setPart, setTaskType, setStatus, setKeyword, setPage,
} = useQuizListing()

const keywordModel = computed({
  get: () => keyword.value,
  set: (v) => setKeyword(v),
})

const hasResults = computed(() => {
  if (mode.value === 'quiz') return filteredItems.value.length > 0
  return filteredItems.value.some((b) => b.mock_tests?.length > 0)
})

// Skill tabs config
const skillTabs = [
  { key: 'reading',   label: 'Reading',   emoji: '📖' },
  { key: 'listening', label: 'Listening', emoji: '🎧' },
  { key: 'writing',   label: 'Writing',   emoji: '✍️' },
  { key: 'speaking',  label: 'Speaking',  emoji: '🎤' },
]

// Part filters
const PARTS = {
  reading:   [{ n: null, l: 'Tất cả' }, { n: 1, l: 'Passage 1' }, { n: 2, l: 'Passage 2' }, { n: 3, l: 'Passage 3' }],
  listening: [{ n: null, l: 'Tất cả' }, { n: 1, l: 'Part 1' }, { n: 2, l: 'Part 2' }, { n: 3, l: 'Part 3' }, { n: 4, l: 'Part 4' }],
  speaking:  [{ n: null, l: 'Tất cả' }, { n: 1, l: 'Part 1' }, { n: 2, l: 'Part 2' }, { n: 3, l: 'Part 3' }, { n: 23, l: 'Part 2&3' }],
}

const WRITING_TASK_TYPES = [
  { n: null, l: 'Tất cả' },
  { n: 1, l: 'Task 1' },
  { n: 2, l: 'Task 2' },
]

const modeTabs = [
  { key: 'quiz',     label: 'Bài lẻ' },
  { key: 'mocktest', label: 'Full đề' },
]

const modeTabsBySkill = computed(() => {
  if (skill.value === 'writing') return modeTabs.filter((m) => m.key === 'quiz')
  return modeTabs
})

const pageTitle = computed(() => {
  if (skill.value === 'reading') return 'Reading Practice'
  if (skill.value === 'listening') return 'Listening Practice'
  if (skill.value === 'writing') return 'Writing Practice'
  return 'Speaking Practice'
})

const skillBadgeVariant = computed(() => {
  if (skill.value === 'reading') return 'blue'
  if (skill.value === 'listening') return 'green'
  if (skill.value === 'writing') return 'orange'
  return 'purple'
})

const skillEmoji = computed(() => {
  if (skill.value === 'reading') return '📖'
  if (skill.value === 'listening') return '🎧'
  if (skill.value === 'writing') return '✍️'
  return '🎤'
})
</script>

<template>
  <AppLayout :title="pageTitle">
    <div class="max-w-7xl mx-auto space-y-5">

      <!-- Page header -->
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-2">
          <span class="text-xl">{{ skillEmoji }}</span>
          <h2 class="text-xl font-bold text-slate-900">{{ pageTitle }}</h2>
        </div>
        <BaseBadge :variant="skillBadgeVariant">
          {{ skill.charAt(0).toUpperCase() + skill.slice(1) }}
        </BaseBadge>
      </div>

      <!-- Filter bar -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-card p-4 space-y-3">
        <!-- Row 1: Skill switch + Mode tabs -->
        <div class="flex items-center gap-3 flex-wrap">
          <!-- Skill switch -->
          <div class="flex rounded-lg border border-slate-200 overflow-hidden shrink-0">
            <button
              v-for="s in skillTabs"
              :key="s.key"
              :class="[
                'flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold transition-colors',
                skill === s.key
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50',
              ]"
              @click="setSkill(s.key)"
            >
              {{ s.emoji }} {{ s.label }}
            </button>
          </div>

          <!-- Mode tabs -->
          <div class="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              v-for="m in modeTabsBySkill"
              :key="m.key"
              :class="[
                'px-3 py-1.5 text-sm font-semibold transition-colors',
                mode === m.key
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50',
              ]"
              @click="setMode(m.key)"
            >
              {{ m.label }}
            </button>
          </div>

          <!-- Spacer -->
          <div class="flex-1" />

          <!-- Status + Search -->
          <StatusTabs :current="status" @change="setStatus" />
          <SearchBar v-model="keywordModel" />
        </div>

        <!-- Row 2: Part filters -->
        <div v-if="skill !== 'writing'" class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-semibold text-slate-500 mr-1">Lọc theo:</span>
          <button
            v-for="p in PARTS[skill]"
            :key="String(p.n)"
            :class="[
              'px-3 py-1 rounded-full text-xs font-semibold border transition-all',
              selectedPart === p.n
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-brand-400 hover:text-brand-600',
            ]"
            @click="setPart(p.n)"
          >
            {{ p.l }}
          </button>
        </div>

        <!-- Writing task type filters -->
        <div v-else class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-semibold text-slate-500 mr-1">Task type:</span>
          <button
            v-for="t in WRITING_TASK_TYPES"
            :key="String(t.n)"
            :class="[
              'px-3 py-1 rounded-full text-xs font-semibold border transition-all',
              taskType === t.n
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-brand-400 hover:text-brand-600',
            ]"
            @click="setTaskType(t.n)"
          >
            {{ t.l }}
          </button>
        </div>
      </div>

      <!-- Content area -->
      <div>
        <!-- Loading skeleton -->
        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <SkeletonCard v-for="i in 8" :key="i" />
        </div>

        <!-- Error -->
        <div v-else-if="error" class="py-16 text-center">
          <p class="text-4xl mb-3">⚠️</p>
          <p class="text-sm font-semibold text-red-600 mb-1">Không thể tải dữ liệu</p>
          <p class="text-xs text-slate-500">{{ error.message }}</p>
        </div>

        <!-- Empty -->
        <div v-else-if="!hasResults" class="py-16 text-center">
          <p class="text-4xl mb-3">🔍</p>
          <p class="text-sm font-semibold text-slate-700 mb-1">Không tìm thấy bài tập phù hợp</p>
          <p class="text-xs text-slate-400">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</p>
          <BaseButton
            variant="secondary"
            size="sm"
            class="mt-3"
            @click="setPart(null); setTaskType(null); setKeyword('')"
          >
            Xoá bộ lọc
          </BaseButton>
        </div>

        <!-- Quiz grid (bài lẻ) -->
        <div
          v-else-if="mode === 'quiz'"
          class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <QuizCard
            v-for="q in filteredItems"
            :key="q.id"
            :quiz="q"
            :skill="skill"
          />
        </div>

        <!-- Mocktest list (full đề) -->
        <template v-else>
          <BookGroupSection
            v-for="book in filteredItems"
            :key="book.title"
            :book="book"
            :skill="skill"
          />
        </template>

        <!-- Pagination -->
        <div v-if="hasResults" class="mt-6">
          <PaginationBar
            :current-page="page"
            :total-pages="totalPages"
            @change="setPage"
          />
        </div>
      </div>
    </div>
  </AppLayout>
</template>
