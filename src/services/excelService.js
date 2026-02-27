import { apiEmail } from './api'

export async function importExcel(file) {
  const fd = new FormData()
  fd.append('file', file)
  return apiEmail('/api/v1/excel/import', { method: 'POST', body: fd, skipContentType: true })
}

/**
 * GET /api/v1/excel/campaigns con paginación y búsqueda (según doc).
 */
export async function listCampaigns({ page = 1, limit = 10, search = '' } = {}) {
  const params = new URLSearchParams()
  if (page != null) params.set('page', String(page))
  if (limit != null) params.set('limit', String(limit))
  if (search && String(search).trim()) params.set('search', String(search).trim())
  const qs = params.toString()
  const url = '/api/v1/excel/campaigns' + (qs ? '?' + qs : '')
  const data = await apiEmail(url)
  return Array.isArray(data) ? data : (data.data || data.campaigns || data.items || [])
}
