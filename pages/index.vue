<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
    <header class="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-white hover:text-blue-100 transition-colors duration-200" @click="refreshPage">
          Araba Uzmanı AI
        </h1>
        <button 
          v-if="isAuthenticated" 
          @click="handleLogout" 
          class="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-400 rounded-lg transition-colors duration-200 shadow-sm"
        >
          Çıkış Yap
        </button>
      </div>
    </header>

    <main class="flex-grow flex flex-col max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div class="flex-grow overflow-y-auto py-6" ref="chatContainer">
        <div class="space-y-6">
          <div v-for="(message, index) in messages" :key="index" 
            class="transition-all duration-300 ease-in-out"
            :class="{'opacity-0 translate-y-4': isLoading && index === messages.length - 1}">
            <div :class="[
              'rounded-2xl p-4 shadow-sm max-w-[80%] break-words',
              message.isUser ? 
                'bg-blue-600 text-white ml-auto' : 
                'bg-white text-gray-800 mr-auto border border-gray-100'
            ]">
              <p class="leading-relaxed whitespace-pre-wrap">{{ message.text }}</p>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="mt-6">
          <div class="flex items-center space-x-2 p-4 bg-white rounded-2xl shadow-sm mr-auto max-w-[60%]">
            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>

      <div class="fixed bottom-0 left-0 right-0 py-4 bg-white shadow-lg">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <form @submit.prevent="sendMessage" class="flex items-center gap-4">
            <div class="relative flex-grow">
              <input
                v-model="userInput"
                type="text"
                placeholder="Arabalar hakkında bir soru sorun..."
                class="w-full px-6 py-4 text-gray-700 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 border border-gray-200"
                :disabled="isLoading"
              />
            </div>
            <button
              type="submit"
              :disabled="isLoading"
              class="px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 min-w-[140px] justify-center shadow-md hover:shadow-lg"
            >
              <span v-if="isLoading">
                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              <span>{{ isLoading ? 'Gönderiliyor...' : 'Gönder' }}</span>
            </button>
          </form>
        </div>
      </div>
    </main>

    <footer class="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg mt-auto">
      <div class="py-4 text-center">
        <p class="text-white text-sm">&copy; 2024 Araba Uzmanı AI. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()
const { user, isAuthenticated, signOut, checkAuth, getIdToken } = useAuth()

const messages = ref([])
const userInput = ref('')
const chatContainer = ref(null)
const isLoading = ref(false)

onMounted(async () => {
  try {
    await checkAuth()
    if (!isAuthenticated.value) {
      router.push('/login')
      return
    }
    loadMessages()
  } catch (error) {
    console.error('Authentication hatası:', error)
    router.push('/login')
  }
})

const loadMessages = () => {
  if (user.value?.uid) {
    const savedMessages = localStorage.getItem(`messages_${user.value.uid}`)
    if (savedMessages) {
      try {
        messages.value = JSON.parse(savedMessages)
      } catch(error) {
        console.error('json hatası',error)
      }
      nextTick(() => {
        scrollToBottom()
      })
    }
  }
}

const saveMessages = () => {
  if (user.value?.uid) {
    localStorage.setItem(`messages_${user.value.uid}`, JSON.stringify(messages.value))
  }
}

watch(messages, () => {
  saveMessages()
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

const handleLogout = async () => {
  try {
    await signOut()
  } catch (error) {
    console.error('Çıkış yapma hatası:', error)
  }
}

const refreshPage = () => {
  window.location.reload()
}

const sendMessage = async () => {
  if (userInput.value.trim() === '' || isLoading.value) return

  const userMessage = userInput.value
  userInput.value = ''
  isLoading.value = true

  messages.value.push({ text: userMessage, isUser: true })

  try {
    const idToken = await getIdToken()
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ message: userMessage }),
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    messages.value.push({ text: data.message, isUser: false })
  } catch (error) {
    console.error('API çağrısı sırasında hata:', error)
    messages.value.push({ text: error.message || 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', isUser: false })
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}
</script>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(59, 130, 246, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(59, 130, 246, 0.5);
  border-radius: 2px;
}

.flex-grow.overflow-y-auto {
  height: calc(100vh - 280px);
  min-height: 400px;
  margin-bottom: 120px;
  padding-bottom: 20px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mb-4 {
  animation: slideIn 0.3s ease-out forwards;
}

footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.fixed.bottom-0 {
  z-index: 20;
  margin-bottom: 60px;
}

@media (max-width: 640px) {
  .fixed.bottom-0 {
    margin-bottom: 50px;
  }
  
  .flex-grow.overflow-y-auto {
    height: calc(100vh - 240px);
    margin-bottom: 100px;
  }
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>