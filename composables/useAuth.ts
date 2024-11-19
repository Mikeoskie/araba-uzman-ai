import { ref, computed } from 'vue'
import { type Auth, type User, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'

const user = ref<User | null>(null)
const isAuthenticated = computed(() => user.value !== null)
const loading = ref(true)

export const useAuth = () => {
  const { $auth } = useNuxtApp()
  const router = useRouter()
  const auth = $auth as Auth


  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      user.value = userCredential.user
      return user.value
    } catch (error) {
      console.error('Google login error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      user.value = null
      router.push('/login')
    } catch (error: any) {
      console.error('Çıkış yapma hatası:', error)
      throw error
    }
  }

  const checkAuth = async () => {
    return new Promise<User | null>((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((userData) => {
        user.value = userData
        loading.value = false
        unsubscribe()
        resolve(userData)
      })
    })
  }

  const getIdToken = async () => {
    if (user.value) {
      return await user.value.getIdToken()
    }
    throw new Error('Kullanıcı giriş yapmamış')
  }

  return {
    user,
    isAuthenticated,
    loading,
    loginWithGoogle,
    signOut,
    checkAuth,
    getIdToken
  }
}