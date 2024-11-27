import { ref } from 'vue'

export const useChat = () => {
  const { getIdToken } = useAuth()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const sendMessage = async (message: string) => {
    try {
      loading.value = true
      error.value = null
      
      // Auth token'ını al
      const token = await getIdToken()
      
      // İsteği gönder
      const response = await $fetch('/api/chat', {
        method: 'POST',
        body: { message },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      return response
    } catch (e: any) {
      error.value = e.message || 'Bir hata oluştu'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    sendMessage,
    loading,
    error
  }
} 