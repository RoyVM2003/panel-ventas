/**
 * Configuración de APIs.
 * Backend: osdemsventas.site
 * Para otro dominio, usar .env: VITE_API_BASE y VITE_API_AI_BASE
 */
export const API_BASE = import.meta.env.VITE_API_BASE || 'https://osdemsventas.site'
export const API_AI_BASE = import.meta.env.VITE_API_AI_BASE || import.meta.env.VITE_API_BASE || 'https://osdemsventas.site'

export const TOKEN_KEY = 'osdemsventas_token'
export const EMAIL_KEY = 'osdemsventas_email'
