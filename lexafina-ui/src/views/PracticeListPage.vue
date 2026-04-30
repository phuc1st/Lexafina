<script setup>
import { computed } from 'vue'
import { useQuizListing } from '../composables/useQuizListing'

import SkillTabs from '../components/list/SkillTabs.vue'
import PracticeSidebar from '../components/list/PracticeSidebar.vue'
import StatusTabs from '../components/list/StatusTabs.vue'
import SearchBar from '../components/list/SearchBar.vue'
import QuizCard from '../components/list/QuizCard.vue'
import BookGroupSection from '../components/list/BookGroupSection.vue'
import PaginationBar from '../components/list/PaginationBar.vue'

const {
  skill, mode, status, selectedPart, keyword, page,
  data, loading, error,
  totalPages, filteredItems,
  setSkill, setMode, setPart, setStatus, setKeyword, setPage,
} = useQuizListing()

// Convenience cho v-model với SearchBar
const keywordModel = computed({
  get: () => keyword.value,
  set: (v) => setKeyword(v),
})

// State derived: có data sau khi filter chưa?
const hasResults = computed(() => {
  if (mode.value === 'quiz') return filteredItems.value.length > 0
  return filteredItems.value.some((book) => book.mock_tests?.length > 0)
})
</script>

<template>
  <div class="page">
    <SkillTabs :current="skill" @change="setSkill" />

    <div class="page__body">
      <PracticeSidebar
        :skill="skill"
        :mode="mode"
        :selected-part="selectedPart"
        @change-skill="setSkill"
        @change-mode="setMode"
        @change-part="setPart"
      />

      <main class="main">
        <header class="main__top">
          <StatusTabs :current="status" @change="setStatus" />
          <SearchBar v-model="keywordModel" />
        </header>

        <a class="history-link" href="#">Xem lịch sử làm bài</a>

        <section class="result">
          <div v-if="loading" class="state">Đang tải...</div>
          <div v-else-if="error" class="state state--err">
            Lỗi: {{ error.message }}
          </div>
          <div v-else-if="!hasResults" class="state">
            Không có bài tập nào phù hợp.
          </div>

          <!-- Bài lẻ: grid phẳng các QuizCard -->
          <div
            v-else-if="mode === 'quiz'"
            class="grid"
          >
            <QuizCard
              v-for="q in filteredItems"
              :key="q.id"
              :quiz="q"
              :skill="skill"
            />
          </div>

          <!-- Full đề: list các BookGroup -->
          <template v-else>
            <BookGroupSection
              v-for="book in filteredItems"
              :key="book.title"
              :book="book"
              :skill="skill"
            />
          </template>

          <PaginationBar
            :current-page="page"
            :total-pages="totalPages"
            @change="setPage"
          />
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #fff;
}
.page__body {
  display: flex;
  align-items: stretch;
}
.main {
  flex: 1;
  padding: 20px 28px 40px;
  background: #fff;
  min-width: 0;
}
.main__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.history-link {
  display: inline-block;
  margin-bottom: 18px;
  color: #1e40af;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}
.history-link:hover { text-decoration: underline; }

.result {
  min-height: 200px;
}
.state {
  padding: 48px 0;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}
.state--err { color: #b91c1c; }

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 1100px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 800px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
