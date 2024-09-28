<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center">
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {{ isRegister ? 'Kayıt Ol' : 'Giriş Yap' }}
          </h2>
        </div>
        <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
          <div>
            <label for="email" class="sr-only">E-posta adresi</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              v-model="email"
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="E-posta adresi"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Şifre</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              v-model="password"
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Şifre"
            />
          </div>
          <div>
            <button
              type="submit"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {{ isRegister ? 'Kayıt Ol' : 'Giriş Yap' }}
            </button>
          </div>
        </form>
        <div class="text-center">
          <button @click="toggleRegister" class="text-blue-600 hover:text-blue-800">
            {{ isRegister ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Kayıt olun' }}
          </button>
        </div>
        <p v-if="errorMessage" class="mt-2 text-center text-sm text-red-600">
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuth } from '~/composables/useAuth'
  
  const router = useRouter()
  const { login, register } = useAuth()
  
  const email = ref('')
  const password = ref('')
  const isRegister = ref(false)
  const errorMessage = ref('')
  
  const handleSubmit = async () => {
    try {
      if (isRegister.value) {
        await register(email.value, password.value)
      } else {
        await login(email.value, password.value)
      }
      router.push('/')
    } catch (error) {
      errorMessage.value = error.message
    }
  }
  
  const toggleRegister = () => {
    isRegister.value = !isRegister.value
    errorMessage.value = ''
  }
  </script>