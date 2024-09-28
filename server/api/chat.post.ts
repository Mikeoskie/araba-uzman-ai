import OpenAI from 'openai'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const openai = new OpenAI({
    apiKey: config.openaiApiKey,
  })

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: body.message }],
    })

    return {
      message: completion.choices[0].message?.content
    }
  } catch (error) {
    console.error('OpenAI API hatası:', error)
    return { error: 'AI yanıtı alınamadı' }
  }
})