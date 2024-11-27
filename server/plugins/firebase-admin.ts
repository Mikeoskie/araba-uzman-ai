import { initializeApp, getApps, cert } from 'firebase-admin/app'

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig()
  
  // Firebase Admin'i başlat (eğer başlatılmamışsa)
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: config.firebaseAdmin.projectId,
        clientEmail: config.firebaseAdmin.clientEmail,
        privateKey: config.firebaseAdmin.privateKey.replace(/\\n/g, '\n'),
      })
    })
  }
}) 