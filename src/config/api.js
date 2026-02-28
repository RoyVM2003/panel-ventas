/**
 * Configuración de APIs.
 * Backend: osdemsventas.site
 * Para otro dominio, usar .env: VITE_API_BASE y VITE_API_AI_BASE
 */
export const API_BASE = import.meta.env.VITE_API_BASE || 'https://osdemsventas.site'
export const API_AI_BASE = import.meta.env.VITE_API_AI_BASE || import.meta.env.VITE_API_BASE || 'https://osdemsventas.site'
/** Ruta para verificar correo con código (si el backend usa otra, poner en .env: VITE_AUTH_VERIFY_PATH) */
export const AUTH_VERIFY_PATH = import.meta.env.VITE_AUTH_VERIFY_PATH || '/api/v1/auth/verify'

export const TOKEN_KEY = 'osdemsventas_token'
export const EMAIL_KEY = 'osdemsventas_email'
