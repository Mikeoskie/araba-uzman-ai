export default defineNuxtPlugin(async () => {
  if (process.server) return // Server-side'da çalışmasını engelle
  
  const { checkAuth } = useAuth()
  await checkAuth()
}) 