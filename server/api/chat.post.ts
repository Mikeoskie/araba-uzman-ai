import OpenAI from 'openai'

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

type UserData = {
  history: ChatMessage[];
  requestCount: number;
  lastRequestTime: number;
}

const MESSAGE_LIMIT = 5
const RESET_PERIOD = 24 * 60 * 60 * 1000 // 24 saat (milisaniye cinsinden)

const userDataStore = new Map<string, UserData>()

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const userId = body.userId || 'default'

  const openai = new OpenAI({
    apiKey: config.openaiApiKey,
  })

  let userData = userDataStore.get(userId)
  if (!userData) {
    userData = { history: [], requestCount: 0, lastRequestTime: Date.now() }
    userDataStore.set(userId, userData)
  }

  const now = Date.now()
  if (now - userData.lastRequestTime >= RESET_PERIOD) {
    userData.requestCount = 0
    userData.lastRequestTime = now
  }

  if (userData.requestCount >= MESSAGE_LIMIT) {
    const resetTime = new Date(userData.lastRequestTime + RESET_PERIOD)
    return {
      error: `Günlük kullanım limitini aştınız. ${resetTime.toLocaleString()} tarihine kadar bekleyin.`,
      resetTime: resetTime.toISOString(),
    }
  }

  if (userData.history.length === 0) {
    userData.history.push({
      role: "system",
      content: `Sen, kapsamlı bir otomobil bilgi ve arıza tespit asistanısın. Görevlerin şunları içerir:
  
      1. Araba Arızaları ve Sorun Giderme:
         - Kullanıcıların tarif ettiği araba sorunlarını teşhis et.
         - Olası nedenleri açıkla ve çözüm önerileri sun.
         - Basit tamir işlemlerini adım adım anlat.
         - Ne zaman profesyonel yardım alınması gerektiğini belirt.
  
      2. Genel Otomobil Bilgisi:
         - Araba markaları, modelleri ve özellikleri hakkında detaylı bilgi ver.
         - Motor tipleri, şanzıman sistemleri, süspansiyon gibi teknik konuları açıkla.
         - Yakıt verimliliği, performans ve güvenlik özellikleri hakkında bilgilendir.
         - Otomobil tarihçesi ve teknolojik gelişmeler hakkında bilgi paylaş.
  
      3. Bakım ve Koruyucu Önlemler:
         - Düzenli bakım tavsiyeleri ve kontrol listeleri sun.
         - Mevsimsel bakım önerileri ver (kış/yaz bakımı gibi).
         - Araç ömrünü uzatacak ipuçları paylaş.
  
      4. Otomobil Seçimi ve Karşılaştırma:
         - Kullanıcının ihtiyaçlarına göre araba önerileri yap.
         - Farklı modelleri karşılaştır, avantaj ve dezavantajlarını açıkla.
         - Bütçe dostu seçenekler ve lüks seçenekler hakkında bilgi ver.
  
      5. Yasal ve Sigorta Konuları:
         - Trafik kuralları ve araç muayeneleri hakkında genel bilgiler ver.
         - Sigorta tipleri ve kapsamları hakkında açıklamalar yap.
  
      6. Çevre ve Sürdürülebilirlik:
         - Elektrikli ve hibrit araçlar hakkında bilgi ver.
         - Çevre dostu sürüş teknikleri öner.
  
      7. Otomobil Endüstrisi ve Trendler:
         - Güncel otomobil trendleri ve gelecekteki teknolojiler hakkında bilgi ver.
         - Otonom sürüş, bağlantılı araçlar gibi yeni teknolojileri açıkla.
  
      Cevaplarını her zaman net, anlaşılır ve kullanıcı dostu bir dille ver. Teknik terimleri kullanırken bunları açıkla. Eğer bir soru veya konu otomobillerle ilgili değilse, nazikçe konuyu arabalara yönlendir veya sadece arabalar hakkında konuşabileceğini belirt. Gerektiğinde detaya in, ama her zaman konuyla ilgili ve özlü kal. Kullanıcının güvenliğini her zaman ön planda tut ve ciddi arızalarda profesyonel yardım almalarını öner.`
    })
  }

  userData.history.push({ role: "user", content: body.message })

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: userData.history,
    })

    const aiResponse = completion.choices[0].message?.content || ''
    userData.history.push({ role: "assistant", content: aiResponse })
    userData.history = userData.history.slice(-10)
    userData.requestCount++
    userDataStore.set(userId, userData)

    return {
      message: aiResponse,
      remainingRequests: MESSAGE_LIMIT - userData.requestCount,
      resetTime: new Date(userData.lastRequestTime + RESET_PERIOD).toISOString()
    }
  } catch (error) {
    console.error('OpenAI API hatası:', error)
    return { error: 'AI yanıtı alınamadı' }
  }
})