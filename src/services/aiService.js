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

// Mensaje de estado del backend: no usarlo como cuerpo del correo
const STATUS_ONLY_MESSAGES = [
  'contenido de campaña generado exitosamente',
  'campaign content generated successfully',
]

function isStatusOnlyMessage(text) {
  if (!text || typeof text !== 'string') return true
  const t = text.trim().toLowerCase()
  return STATUS_ONLY_MESSAGES.some((m) => t === m || t.startsWith(m))
}

/** Busca el texto real del cuerpo en la respuesta (incluye datos anidados). */
function findRealBody(data) {
  if (!data) return ''
  const candidates = [
    data.body,
    data.content,
    data.generated_content,
    data.generated_text,
    data.email_body,
    data.campaign_body,
    data.campaign_content,
    data.text,
    data.message,
    data.data?.body,
    data.data?.content,
    data.data?.generated_content,
    data.data?.message,
    data.result?.body ?? data.result?.content,
    typeof data.result === 'string' ? data.result : '',
    data.metadata?.body ?? data.metadata?.content ?? data.metadata?.generated_content,
  ]
  for (const c of candidates) {
    if (c && typeof c === 'string' && c.trim() && !isStatusOnlyMessage(c)) return c.trim()
  }
  return ''
}

/**
 * Devuelve asunto y cuerpo por separado para rellenar "Asunto del correo" y "Mensaje (cuerpo del correo)".
 */
export function getSubjectAndBodyFromAIResponse(data) {
  if (!data) return { subject: '', body: '' }
  if (typeof data === 'string') return { subject: '', body: isStatusOnlyMessage(data) ? '' : data }

  const subject = (data.subject ?? data.asunto ?? data.data?.subject ?? '').trim()
  const bodyText = findRealBody(data)
  const cta = (data.callToAction ?? data.call_to_action ?? '').trim()
  const body = [bodyText, cta].filter(Boolean).join('\n\n')

  if (body) return { subject, body }

  // Solo si no hay cuerpo real: usar message + CTA solo si message no es solo un estado
  const statusMsg = (data?.message && typeof data.message === 'string')
    ? data.message.trim() : ''
  const ctaFallback = (data?.call_to_action ?? data?.callToAction ?? '').trim()
  if (ctaFallback) return { subject, body: ctaFallback }
  if (statusMsg && !isStatusOnlyMessage(statusMsg)) return { subject, body: statusMsg }

  if (data?.text && !isStatusOnlyMessage(data.text)) return { subject, body: data.text }
  if (Array.isArray(data?.choices) && data.choices[0]?.message?.content) {
    const c = data.choices[0].message.content
    return { subject, body: isStatusOnlyMessage(c) ? '' : c }
  }
  return { subject: '', body: '' }
}
