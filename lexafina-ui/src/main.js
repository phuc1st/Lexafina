import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore, connectAuthApi } from './stores/auth'

async function init() {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
  const auth = useAuthStore()
  connectAuthApi(auth)
  await auth.bootstrap()
  app.use(router)
  app.mount('#app')
}

init()
