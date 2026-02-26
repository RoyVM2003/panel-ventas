import { API_BASE, TOKEN_KEY } from '../config/api'

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

/**
 * Cliente HTTP para APIs de email/campañas (con auth).
 */
export async function apiEmail(endpoint, options = {}) {
  const token = getToken()
  const headers = { ...(options.headers || {}) }
  if (token && !headers.Authorization) headers.Authorization = 'Bearer ' + token
  if (!options.skipContentType && options.body !== undefined && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  const res = await fetch(API_BASE + endpoint, {
    method: options.method || 'GET',
    headers,
    body: options.body instanceof FormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined),
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch (_) { data = text }
  if (!res.ok) throw { status: res.status, data }
  return data
}
