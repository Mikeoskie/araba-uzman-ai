import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

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
  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)

  // Kullanıcı UID'sini dinleme fonksiyonu
  const getUserUID = () => {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          resolve(user.uid) // Kullanıcı giriş yaptıysa UID'yi döndür
        } else {
          reject('Kullanıcı giriş yapmamış.') // Giriş yapılmamışsa hata döndür
        }
      })
    })
  }

  return {
    provide: {
      auth: auth,
      getUserUID: getUserUID // getUserUID fonksiyonunu sağlayın
    }
  }
})