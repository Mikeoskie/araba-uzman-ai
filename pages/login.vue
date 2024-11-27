<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">Hoş Geldiniz!</h1>
        <p class="login-subtitle">Araba Uzmanı AI'ya giriş yapın</p>
      </div>
      
      <div class="login-content">
        <button @click="handleGoogleLogin" class="google-button">
          <img 
            src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
            alt="Google"
            class="google-icon"
          />
          Google ile Devam Et
        </button>
        <p class="terms-text">
          Giriş yaparak, hizmet şartlarımızı kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

const error = ref('')
const { loginWithGoogle } = useAuth()
const router = useRouter()
const handleGoogleLogin = async () => {
  try {
    const user = await loginWithGoogle()
    console.log('Logged in with Google:', user)
    router.push('/')
  } catch (e) {
    error.value = e.message
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%);
  padding: 20px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.login-header {
  text-align: center;
  margin-bottom: 35px;
}

.login-title {
  color: #2d3748;
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.login-subtitle {
  color: #4a5568;
  font-size: 1.1rem;
  line-height: 1.5;
}

.login-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.google-button {
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: 16px;
  background: white;
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.google-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  background: #f8fafc;
}

.google-button:active {
  transform: translateY(0);
}

.google-icon {
  width: 24px;
  height: 24px;
}

.terms-text {
  color: #718096;
  font-size: 0.9rem;
  text-align: center;
  line-height: 1.5;
  padding: 0 10px;
}

/* Mobil cihazlar için responsive tasarım */
@media (max-width: 640px) {
  .login-card {
    padding: 30px 24px;
  }

  .login-title {
    font-size: 2rem;
  }

  .google-button {
    padding: 12px 20px;
  }
}

/* Animasyonlar */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-card {
  animation: fadeIn 0.6s ease-out;
}
</style>