import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to) => {
  // Server-side'da çalışmasını engelle
  if (process.server) return

  const { isAuthenticated, loading, authInitialized, checkAuth } = useAuth()

  // Auth henüz başlatılmadıysa, bekle
  if (!authInitialized.value) {
    await checkAuth()
  }

  // Auth yükleniyorsa bekle
  if (loading.value) {
    return
  }

  // Login sayfası kontrolü
  if (to.path === '/login') {
    if (isAuthenticated.value) {
      return navigateTo('/')
    }
    return
  }

  // Diğer sayfalar için auth kontrolü
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})