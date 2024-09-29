import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: config.public.firebaseConfig.apiKey,
    authDomain: config.public.firebaseConfig.authDomain,
    projectId: config.public.firebaseConfig.projectId,
    storageBucket: config.public.firebaseConfig.storageBucket,
    messagingSenderId: config.public.firebaseConfig.messagingSenderId,
    appId: config.public.firebaseConfig.appId
  }

  console.log('Firebase config:', firebaseConfig) 

  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)

  return {
    provide: {
      auth: auth
    }
  }
})