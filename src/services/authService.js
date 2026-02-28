import { apiEmail } from './api'
import { API_BASE, AUTH_VERIFY_PATH, TOKEN_KEY, EMAIL_KEY } from '../config/api'

export function getStoredToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function getStoredEmail() {
  return sessionStorage.getItem(EMAIL_KEY)
}

export function setSession(token, email) {
  sessionStorage.setItem(TOKEN_KEY, token || '')
  sessionStorage.setItem(EMAIL_KEY, email || '')
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(EMAIL_KEY)
}

export async function login(email, password) {
  const data = await apiEmail('/api/v1/auth/login', { method: 'POST', body: { email, password } })
  const token = data.token || data.accessToken || data.access_token
  if (!token) throw new Error('La API no devolvió token')
  return { token, email }
}

export async function register({ email, password, first_name, last_name }) {
  // El backend espera multipart/form-data con:
  // email, password, first_name, last_name, imagen (opcional)
  const fd = new FormData()
  fd.append('email', email)
  fd.append('password', password)
  fd.append('first_name', first_name)
  fd.append('last_name', last_name)

  const res = await fetch(API_BASE + '/api/v1/auth/register', {
    method: 'POST',
    body: fd,
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch (_) { data = text }
  if (!res.ok) throw { status: res.status, data }
  return data
}

/**
 * Verificar cuenta con el código enviado por correo.
 * POST /api/v1/auth/verify — Body: { email, code }
 */
export async function verifyEmail(email, code) {
  const res = await fetch(API_BASE + AUTH_VERIFY_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code: String(code).trim() }),
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch (_) { data = text }
  if (!res.ok) throw { status: res.status, data }
  return data
}

/**
 * Reenviar correo de verificación.
 * POST /api/v1/auth/resend-verification — Body: { email }
 */
export async function resendVerification(email) {
  const res = await fetch(API_BASE + '/api/v1/auth/resend-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: String(email).trim() }),
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch (_) { data = text }
  if (!res.ok) throw { status: res.status, data }
  return data
}

/**
 * Solicita restablecimiento de contraseña.
 * Usa POST /api/v1/auth/forgot-password del backend.
 */
export async function forgotPassword(email) {
  const res = await fetch(API_BASE + '/api/v1/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch (_) { data = text }
  if (!res.ok) throw { status: res.status, data }
  return data
}
