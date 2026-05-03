import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Lazy-load các trang để tối ưu bundle size
const LoginView       = () => import('../views/LoginView.vue')
const RegisterView    = () => import('../views/RegisterView.vue')
const DashboardPage   = () => import('../views/DashboardPage.vue')
const PracticeListPage = () => import('../views/PracticeListPage.vue')
const ReadingPage     = () => import('../views/ReadingPage.vue')
const ListeningPage   = () => import('../views/ListeningPage.vue')
const WritingPracticePage = () => import('../views/WritingPracticePage.vue')
const SpeakingPracticePage = () => import('../views/SpeakingPracticePage.vue')
const ResultPage      = () => import('../views/ResultPage.vue')
const ProfilePage     = () => import('../views/ProfilePage.vue')

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    // Auth routes (không cần login)
    { path: '/', redirect: '/dashboard' },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresGuest: true },
    },

    // App routes (cần đăng nhập)
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfilePage,
      meta: { requiresAuth: true },
    },

    // Practice list — filter theo skill
    // query: ?mode=quiz|mocktest&part=1&page=2&q=...
    {
      path: '/practice/:skill(reading|listening|writing|speaking)',
      name: 'practice-list',
      component: PracticeListPage,
      props: true,
      meta: { requiresAuth: true },
    },

    // Practice detail pages
    {
      path: '/practice/reading/:quizId(\\d+)',
      name: 'reading',
      component: ReadingPage,
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/practice/listening/:quizId(\\d+)',
      name: 'listening',
      component: ListeningPage,
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/practice/writing/:quizId(\\d+)',
      name: 'writing-practice',
      component: WritingPracticePage,
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/practice/speaking/:quizId(\\d+)',
      name: 'speaking-practice',
      component: SpeakingPracticePage,
      props: true,
      meta: { requiresAuth: true },
    },

    // Result
    {
      path: '/result/:quizId',
      name: 'result',
      component: ResultPage,
      props: true,
      meta: { requiresAuth: true },
    },

    // Placeholder routes cho Phase 2
    {
      path: '/writing',
      name: 'writing',
      redirect: { name: 'practice-list', params: { skill: 'writing' } },
      meta: { requiresAuth: true },
    },
    {
      path: '/speaking',
      name: 'speaking',
      redirect: { name: 'practice-list', params: { skill: 'speaking' } },
      meta: { requiresAuth: true },
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/ComingSoonPage.vue'),
      meta: { requiresAuth: true },
    },

    // 404
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
})

// Navigation guards
router.beforeEach((to) => {
  // Phải gọi useAuthStore() bên trong guard để Pinia đã được khởi tạo
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresGuest && auth.isLoggedIn) {
    return { name: 'dashboard' }
  }
})

export default router
