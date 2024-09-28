import { ref, computed } from 'vue'
import { auth } from '~/plugins/firebase'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'

const user = ref<User | null>(null)
const isAuthenticated = computed(() => user.value !== null)

export const useAuth = () => {
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
    onAuthStateChanged(auth, (currentUser) => {
      user.value = currentUser
    })
  }

  return {
    user,
    isAuthenticated,
    register,
    login,
    signOut,
    initAuth
  }
}