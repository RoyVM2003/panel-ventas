import { apiEmail } from './api'

export async function importExcel(file) {
  const fd = new FormData()
  fd.append('file', file)
  return apiEmail('/api/v1/excel/import', { method: 'POST', body: fd, skipContentType: true })
}

export async function listCampaigns() {
  const data = await apiEmail('/api/v1/excel/campaigns')
  return Array.isArray(data) ? data : (data.data || data.campaigns || data.items || [])
}
