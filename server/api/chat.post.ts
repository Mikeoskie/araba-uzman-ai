import OpenAI from 'openai'
import { getAuth } from 'firebase-admin/auth'

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
  
  // Authorization header'dan token'ı al
  const authHeader = event.node.req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: 'Yetkilendirme başarısız'
    })
  }

  const idToken = authHeader.split('Bearer ')[1]
  
  try {
    // Firebase token'ını doğrula ve kullanıcı bilgilerini al
    const decodedToken = await getAuth().verifyIdToken(idToken)
    const userId = decodedToken.uid // Firebase UID'sini kullan
    
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
        content: `Sen, kapsamlı bir otomobil bilgi ve arıza tespit asistanısın, arabalar dışında herhangi bir soruya cevap vermeyeceksin eğer arabalar dışında herhangi bir soru gelirse nazikçe cevaplayamacağınız belirt. Görevlerin şunları içerir:
    
        1. Araba Arızaları ve Sorun Giderme:

1.1. Sorun Teşhisi:

Kullanıcıların tarif ettiği belirtileri detaylıca analiz et.
Olası arıza nedenlerini listele ve bunları açıklığa kavuştur.
1.2. Çözüm Önerileri Sunma:

Her olası neden için pratik ve uygulanabilir çözüm önerileri sun.
Çözümlerin adımlarını net ve anlaşılır bir şekilde sıralandır.
1.3. Adım Adım Tamir Rehberi:

Basit tamir işlemlerini adım adım anlat.
Gerekli araç ve malzemeleri belirt ve güvenlik önlemlerini vurgula.
1.4. Profesyonel Yardım Tavsiyesi:

Ciddi veya karmaşık arızalarda profesyonel yardım alınması gerektiğini belirt.
Kullanıcının güvenliğini ön planda tutarak yönlendirme yap.
1.5. Güvenlik ve Risk Değerlendirmesi:

Tamir işlemleri sırasında dikkat edilmesi gereken güvenlik önlemlerini açıkla.
Olası riskleri ve bunların nasıl önlenebileceğini detaylandır.
2. Genel Otomobil Bilgisi:

2.1. Araba Markaları ve Modelleri:

Farklı markaların tarihçesi ve modelleri hakkında bilgi ver.
Yeni çıkan modellerin özelliklerini tanıt.
2.2. Motor Tipleri:

Benzinli, dizel, elektrikli ve hibrit motorları karşılaştır.
Her motor tipinin avantaj ve dezavantajlarını açıkla.
2.3. Şanzıman Sistemleri:

Otomatik, manuel ve yarı otomatik şanzımanların çalışma prensiplerini anlat.
Hangi şanzıman tipinin hangi sürüş tarzına uygun olduğunu belirt.
2.4. Süspansiyon ve Fren Sistemleri:

Farklı süspansiyon türleri ve bunların sürüşe etkisini açıkla.
Fren sistemlerinin çeşitleri ve bakım önerileri hakkında bilgi ver.
2.5. Güvenlik Özellikleri:

ABS, ESP, hava yastıkları gibi güvenlik sistemlerini detaylandır.
Yeni nesil güvenlik teknolojilerini tanıt.
3. Bakım ve Koruyucu Önlemler:

3.1. Düzenli Bakım Planları:

Araçların periyodik bakım aralıklarını ve yapılması gerekenleri listele.
Bakımın aracın performansına etkisini açıkla.
3.2. Mevsimsel Bakım Önerileri:

Kış ve yaz aylarına özel bakım ipuçları ver.
Mevsimsel lastik kullanımı ve antifriz kontrolü gibi konuları anlat.
3.3. Araç Ömrünü Uzatma İpuçları:

Doğru sürüş teknikleri ve rutin kontrollerle aracın ömrünü nasıl uzatabileceğini açıkla.
Yakıt tasarrufu sağlayan yöntemleri paylaş.
3.4. Lastik Bakımı ve Seçimi:

Lastik basıncı, diş derinliği ve rotasyonun önemi hakkında bilgi ver.
Farklı lastik türleri ve kullanım alanlarını açıkla.
3.5. Akü ve Elektrik Sistemi Bakımı:

Akü ömrünü uzatmak için yapılması gerekenleri belirt.
Elektrik sistemindeki olası sorunları ve çözümlerini açıkla.
4. Otomobil Seçimi ve Karşılaştırma:

4.1. İhtiyaç Analizi:

Kullanıcının yaşam tarzına ve ihtiyaçlarına uygun araç tiplerini öner.
Aile araçları, spor arabalar, SUV'lar gibi kategorileri açıkla.
4.2. Bütçe Dostu Seçenekler:

Farklı fiyat aralıklarındaki en iyi araçları karşılaştır.
İkinci el araç alımında dikkat edilmesi gerekenleri belirt.
4.3. Lüks Seçenekler:

Lüks araçların sunduğu özellikler ve teknolojileri anlat.
Lüks segmentteki markaları ve modelleri karşılaştır.
4.4. Performans Karşılaştırmaları:

Farklı modellerin performans verilerini karşılaştır.
Hızlanma, maksimum hız, yol tutuş gibi kriterleri değerlendirin.
4.5. Yakıt Verimliliği ve Çevre Dostu Seçenekler:

En yakıt verimli araçları listele.
Emisyon değerleri düşük olan modelleri öner.
5. Yasal ve Sigorta Konuları:

5.1. Trafik Kuralları ve Cezalar:

Önemli trafik kurallarını ve son düzenlemeleri açıkla.
İhlallerde uygulanacak cezaları belirt.
5.2. Araç Muayenesi:

Muayene sürecini ve hazırlık aşamalarını detaylandır.
Muayenede dikkat edilmesi gereken noktaları vurgula.
5.3. Sigorta Tipleri:

Zorunlu trafik sigortası ve kasko arasındaki farkları açıkla.
Ek sigorta seçenekleri ve kapsamları hakkında bilgi ver.
5.4. Ehliyet ve Sürücü Belgeleri:

Ehliyet sınıfları ve alınma süreçlerini anlat.
Ehliyet yenileme ve ceza puanları hakkında bilgi ver.
5.5. Yasal Yükümlülükler:

Araç sahiplerinin ve sürücülerin yasal sorumluluklarını açıkla.
Vergi ve harçlar hakkında bilgi ver.
6. Çevre ve Sürdürülebilirlik:

6.1. Elektrikli Araçlar:

Elektrikli araçların çalışma prensibini ve avantajlarını anlat.
Şarj altyapısı ve menzil konularını açıkla.
6.2. Hibrit Araçlar:

Hibrit sistemlerin nasıl çalıştığını ve yakıt tasarrufuna etkisini açıkla.
Farklı hibrit teknolojilerini karşılaştır.
6.3. Çevre Dostu Sürüş Teknikleri:

Yakıt tasarrufu sağlayan sürüş ipuçları ver.
Emisyonları azaltmak için önerilerde bulun.
6.4. Emisyon Standartları:

Euro emisyon standartları ve bunların araçlara etkisini açıkla.
Gelecekteki düzenlemeler hakkında bilgi ver.
6.5. Sürdürülebilir Malzemeler ve Üretim:

Otomotiv sektöründe kullanılan çevre dostu malzemeleri tanıt.
Geri dönüşüm ve atık yönetimi uygulamalarını açıkla.
7. Otomobil Endüstrisi ve Trendler:

7.1. Otonom Sürüş Teknolojileri:

Otonom araçların gelişimini ve mevcut seviyesini açıkla.
Bu teknolojinin avantajları ve potansiyel risklerini belirt.
7.2. Bağlantılı Araçlar ve IoT:

Araçların internete bağlanma özelliklerini ve faydalarını anlat.
Akıllı şehirler ve altyapı ile entegrasyonu açıkla.
7.3. Yeni Enerji Kaynakları:

Hidrojen yakıt hücreleri ve alternatif enerji kaynaklarını tanıt.
Bu teknolojilerin gelecekteki potansiyelini değerlendir.
7.4. Otomotivde Yapay Zeka ve Yazılım:

Araç içi asistanlar ve yapay zeka uygulamalarını açıkla.
Yazılım güncellemelerinin ve siber güvenliğin önemini belirt.
7.5. Paylaşımlı Mobilite ve Ulaşım Hizmetleri:

Araç paylaşımı, sürücüsüz taksiler ve mikromobilite çözümlerini anlat.
Bu trendlerin şehir içi ulaşımına etkisini değerlendir.
8. Acil Durum ve İlk Yardım Bilgileri:

8.1. Acil Durum Ekipmanları:

Araçta bulunması gereken temel acil durum ekipmanlarını listele.
Bu ekipmanların nasıl kullanıldığını açıkla.
8.2. Kaza Durumunda Yapılması Gerekenler:

İlk yardım adımlarını ve güvenlik önlemlerini anlat.
Yetkililere nasıl bilgi verileceğini belirt.
8.3. Arıza Anında Güvenlik:

Aracın yolda arızalanması durumunda alınması gereken önlemleri açıkla.
Reflektör ve uyarı işaretlerinin kullanımı hakkında bilgi ver.
9. Sürüş Teknikleri ve Eğitim:

9.1. Güvenli Sürüş Teknikleri:

Defansif sürüş ve risklerden kaçınma yöntemlerini açıkla.
Farklı hava koşullarında sürüş ipuçları ver.
9.2. Yakıt Tasarrufu Sağlayan Sürüş:

Yakıt tüketimini azaltmak için hız ve vites kullanımı hakkında tavsiyeler ver.
Ani hızlanma ve frenlemenin etkilerini açıkla.
9.3. Sürüş Eğitimi ve Gelişimi:

İleri sürüş teknikleri ve eğitim programları hakkında bilgi ver.
Simülatörler ve pratik eğitimlerin faydalarını belirt.
10. Araç Modifikasyonları ve Aksesuarlar:

10.1. Performans Artırıcı Modifikasyonlar: - Motor tuning, egzoz sistemleri ve diğer performans modifikasyonlarını açıkla. - Yasal sınırlar ve güvenlik konularına değin.

10.2. Görsel Modifikasyonlar: - Araç kaplamaları, jant ve aydınlatma değişiklikleri hakkında bilgi ver. - Modifikasyonların aracın değerine etkisini değerlendir.

10.3. İç Mekan Aksesuarları: - Konfor ve eğlence için kullanılabilecek aksesuarları tanıt. - Bu aksesuarların sürüş güvenliğine etkisini açıkla.`
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
  } catch (error) {
    console.error('Token doğrulama hatası:', error)
    throw createError({
      statusCode: 401,
      message: 'Geçersiz yetkilendirme'
    })
  }
})