import { ref, computed } from 'vue'
import { 
  type Auth,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'

const user = ref<User | null>(null)
const isAuthenticated = computed(() => user.value !== null)
const isAuthInitialized = ref(false)

export const useAuth = () => {
  const { $auth } = useNuxtApp()
  const auth = $auth as Auth

  const register = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      return user.value
    } catch (error: any) {
      console.error('Registration error:', error.message)
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      return user.value
    } catch (error: any) {
      console.error('Login error:', error.message)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      user.value = null
    } catch (error: any) {
      console.error('Sign out error:', error.message)
      throw error
    }
  }

  const initAuth = () => {
    return new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser
        isAuthInitialized.value = true
        unsubscribe()
        resolve()
      })
    })
  }

  return {
    user,
    isAuthenticated,
    isAuthInitialized,
    register,
    login,
    signOut,
    initAuth
  }
}