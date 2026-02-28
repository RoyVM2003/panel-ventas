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

  // Backend puede devolver body/callToAction (camelCase) o body/call_to_action (snake_case)
  const bodyText =
    data.body ?? data.content ?? data.generated_content ?? data.generated_text ?? ''
  const cta =
    data.callToAction ?? data.call_to_action ?? ''
  const subject = data.subject ?? data.asunto ?? ''

  const parts = []
  if (subject && typeof subject === 'string') parts.push(subject.trim())
  if (bodyText && typeof bodyText === 'string') parts.push(bodyText.trim())
  if (cta && typeof cta === 'string') parts.push(cta.trim())

  if (parts.length) return parts.join('\n\n')

  // Fallback: backend solo devuelve message + call_to_action (sin body)
  const statusMsg = data?.message && typeof data.message === 'string' ? data.message.trim() : ''
  const ctaFallback = data?.call_to_action ?? data?.callToAction
  const ctaStr = ctaFallback && typeof ctaFallback === 'string' ? ctaFallback.trim() : ''
  if (statusMsg || ctaStr) {
    const fallbackParts = []
    if (statusMsg) fallbackParts.push(statusMsg)
    if (ctaStr) fallbackParts.push(ctaStr)
    if (fallbackParts.length) return fallbackParts.join('\n\n')
  }

  if (data?.text) return data.text
  if (Array.isArray(data?.choices) && data.choices[0]?.message?.content) {
    return data.choices[0].message.content
  }

  // No rellenar el cuerpo con JSON crudo (success, metadata, etc.)
  return ''
}
