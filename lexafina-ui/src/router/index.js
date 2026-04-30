import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import ReadingPage from '../views/ReadingPage.vue'
import ListeningPage from '../views/ListeningPage.vue'
import ResultPage from '../views/ResultPage.vue'
import PracticeListPage from '../views/PracticeListPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },

    // List page — paginated grid theo skill (reading | listening).
    // Filter sống ở query string: ?mode=quiz|mocktest&part=1&page=2&q=...
    {
      path: '/practice/:skill(reading|listening)',
      name: 'practice-list',
      component: PracticeListPage,
      props: true,
    },

    // Detail/practice pages giữ nguyên route cũ — không xung đột vì có thêm :quizId
    {
      path: '/practice/reading/:quizId(\\d+)',
      name: 'reading',
      component: ReadingPage,
      props: true,
    },
    {
      path: '/practice/listening/:quizId(\\d+)',
      name: 'listening',
      component: ListeningPage,
      props: true,
    },
    {
      path: '/result/:quizId',
      name: 'result',
      component: ResultPage,
      props: true,
    },
  ],
})

export default router
