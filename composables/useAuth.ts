import { ref, computed } from 'vue'
import { type Auth, type User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const user = ref<User | null>(null)
const isAuthenticated = computed(() => user.value !== null)

export const useAuth = () => {
  const { $auth } = useNuxtApp()
  const auth = $auth as Auth

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      return user.value
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

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

  const register = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      return user.value
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const getIdToken = async () => {
    if (user.value) {
      return await user.value.getIdToken()
    }
    throw new Error('User is not authenticated')
  }

  return {
    user,
    isAuthenticated,
    login,
    loginWithGoogle,
    register,
    logout,
    getIdToken
  }
}