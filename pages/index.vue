<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <header class="bg-blue-600 shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-white" @click="refreshPage">Araba Uzmanı AI</h1>
        <button v-if="isAuthenticated" @click="handleSignOut" class="text-white hover:text-gray-200">Çıkış Yap</button>
      </div>
    </header>

    <main v-if="isAuthenticated" class="flex-grow flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex-grow overflow-y-auto py-6" ref="chatContainer">
        <div v-for="(message, index) in messages" :key="index" class="mb-4">
          <div :class="[
            'max-w-xl rounded-lg p-4',
            message.isUser ? 'bg-blue-100 ml-auto' : 'bg-white'
          ]">
            <p class="text-gray-800">{{ message.text }}</p>
          </div>
        </div>
        <div v-if="isLoading" class="flex items-center space-x-2 mb-4">
          <div class="w-3 h-3 bg-gray-500 rounded-full animate-bounce"></div>
          <div class="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>

      <div class="py-4">
        <form @submit.prevent="sendMessage" class="flex items-center">
          <input
            v-model="userInput"
            type="text"
            placeholder="Arabalar hakkında bir soru sorun..."
            class="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            :disabled="isLoading"
            class="bg-blue-500 text-white px-6 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {{ isLoading ? 'Gönderiliyor...' : 'Gönder' }}
          </button>
        </form>
      </div>
    </main>

    <main v-else class="flex-grow flex items-center justify-center">
      <p class="text-xl">Lütfen giriş yapın veya kayıt olun.</p>
    </main>

    <footer class="bg-white shadow-md mt-8">
      <div class="bg-blue-600 text-white py-4 mt-4 text-center">
        <p>&copy; 2024 Araba Uzmanı AI. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()
const { user, isAuthenticated, signOut, initAuth } = useAuth()

const messages = ref([])
const userInput = ref('')
const chatContainer = ref(null)
const isLoading = ref(false)

onMounted(() => {
  initAuth()
})

watch(isAuthenticated, (newValue) => {
  if (!newValue) {
    router.push('/login')
  }
})

const handleSignOut = async () => {
  await signOut()
  router.push('/login')
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
    // API çağrısı burada yapılacak
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
})
</script>

<style>
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.animate-bounce {
  animation: bounce 0.6s infinite;
}

h1 {
  cursor: pointer;
}
</style>