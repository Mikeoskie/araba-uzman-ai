<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtPage />
  </div>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth'

const { initAuth, isAuthInitialized } = useAuth()

// Sayfa yüklendiğinde oturum durumunu kontrol et
onMounted(async () => {
  await initAuth()
})

// // Oturum durumu başlatılana kadar bekle
// await until(isAuthInitialized).toBe(true)
</script>