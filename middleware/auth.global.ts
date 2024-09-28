import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()
  
  if (to.path !== '/login' && !isAuthenticated.value) {
    return navigateTo('/login')
  }
  
  if (to.path === '/login' && isAuthenticated.value) {
    return navigateTo('/')
  }
})