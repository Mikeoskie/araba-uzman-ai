import { ref, computed } from 'vue'
import { type Auth, type User, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'

const user = ref<User | null>(null)
const isAuthenticated = computed(() => user.value !== null)
const loading = ref(true)
const authInitialized = ref(false)

export const useAuth = () => {
  const { $auth } = useNuxtApp()
  const router = useRouter()
  const auth = $auth as Auth

  const checkAuth = async () => {
    if (process.server) return null // Server-side'da çalışmasını engelle
    if (authInitialized.value) return user.value
    
    return new Promise<User | null>((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((userData) => {
        user.value = userData
        loading.value = false
        authInitialized.value = true
        resolve(userData)
      })
    })
  }

  const loginWithGoogle = async () => {
    try {
      loading.value = true
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      const result = await signInWithPopup(auth, provider)
      user.value = result.user
      await router.push('/')
      return user.value
    } catch (error: any) {
      console.error('Google login hatası:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      user.value = null
      if (auth.currentUser) {
        await auth.currentUser.reload()
      }
      router.push('/login')
    } catch (error: any) {
      console.error('Çıkış yapma hatası:', error)
      throw error
    }
  }

  const getIdToken = async () => {
    if (user.value) {
      return await user.value.getIdToken(true)
    }
    throw new Error('Kullanıcı giriş yapmamış')
  }

  return {
    user,
    isAuthenticated,
    loading,
    authInitialized,
    loginWithGoogle,
    signOut,
    checkAuth,
    getIdToken
  }
}