import { API_AI_BASE } from '../config/api'

const getToken = () => sessionStorage.getItem('osdemsventas_token')

function getAIEndpoint(model) {
  if (model === 'ollama-0-5b') return '/api/v1/ollama/qwen2-5-0-5b'
  if (model === 'ollama-1-5b') return '/api/v1/ollama/qwen2-5-1-5b'
  if (model === 'mistral-tiny') return '/api/v1/mistral/mistral-tiny'
  if (model === 'gemini-pro') return '/api/v1/gemini/gemini-pro'
  return '/api/v1/generate'
}

export async function generateText(prompt, model = 'generate') {
  const endpoint = getAIEndpoint(model)
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = 'Bearer ' + token
  const res = await fetch(API_AI_BASE + endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt }),
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch (_) { data = text }
  if (!res.ok) throw { status: res.status, data }
  return data
}

export function extractTextFromAIResponse(data) {
  if (typeof data === 'string') return data
  if (data?.text) return data.text
  if (Array.isArray(data?.choices) && data.choices[0]?.message?.content) {
    return data.choices[0].message.content
  }
  return JSON.stringify(data, null, 2)
}
