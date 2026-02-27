import { API_AI_BASE } from '../config/api'

const getToken = () => sessionStorage.getItem('osdemsventas_token')

/**
 * Llama al endpoint real del backend:
 * POST /api/v1/ai/campaign-suggestion
 */
export async function generateText(prompt) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = 'Bearer ' + token

  const res = await fetch(API_AI_BASE + '/api/v1/ai/campaign-suggestion', {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt }),
  })

  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch (_) {
    data = text
  }
  if (!res.ok) throw { status: res.status, data }
  return data
}

export function extractTextFromAIResponse(data) {
  if (!data) return ''

  // Si el backend devuelve texto plano
  if (typeof data === 'string') return data

  // Doc: genera asunto, cuerpo y llamada a la acción (Mistral AI)
  if (data.subject || data.body || data.callToAction) {
    const subject = data.subject ? String(data.subject).trim() : ''
    const body = data.body ? String(data.body).trim() : ''
    const cta = data.callToAction ? String(data.callToAction).trim() : ''
    const parts = []
    if (subject) parts.push(subject)
    if (body) parts.push(body)
    if (cta) parts.push(cta)
    if (parts.length) return parts.join('\n\n')
  }

  // Compatibilidad con otros formatos de IA (por si se reutiliza backend)
  if (data?.text) return data.text
  if (Array.isArray(data?.choices) && data.choices[0]?.message?.content) {
    return data.choices[0].message.content
  }

  return JSON.stringify(data, null, 2)
}
