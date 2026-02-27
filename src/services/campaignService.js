import { apiEmail } from './api'

export async function createCampaign({ name, subject, body }) {
  return apiEmail('/api/v1/excel/campaigns', {
    method: 'POST',
    body: { name: name || subject, subject, body },
  })
}

/**
 * Envía campaña según la API: POST /api/v1/campaigns/send
 * Body: { subject, message } — asunto y cuerpo del correo.
 */
export async function sendCampaign(subject, message) {
  return apiEmail('/api/v1/campaigns/send', {
    method: 'POST',
    body: { subject, message },
  })
}
