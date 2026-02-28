import { apiEmail } from './api'

/** POST /api/v1/excel/campaigns — Crear campaña. Body: { name, subject, body }. */
export async function createCampaign({ name, subject, body }) {
  return apiEmail('/api/v1/excel/campaigns', {
    method: 'POST',
    body: { name: name || subject, subject, body },
  })
}

/** GET /api/v1/excel/campaigns/{id} — Obtener una campaña por ID. */
export async function getCampaign(id) {
  return apiEmail(`/api/v1/excel/campaigns/${encodeURIComponent(id)}`)
}

/** PUT /api/v1/excel/campaigns/{id} — Actualizar campaña. Body: { name?, subject?, body? }. */
export async function updateCampaign(id, { name, subject, body }) {
  return apiEmail(`/api/v1/excel/campaigns/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: { name, subject, body },
  })
}

/** DELETE /api/v1/excel/campaigns/{id} — Eliminar campaña. */
export async function deleteCampaign(id) {
  return apiEmail(`/api/v1/excel/campaigns/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

/**
 * POST /api/v1/campaigns/send — Enviar campaña a todos los contactos activos.
 * Body: { subject, message } — asunto y cuerpo del correo.
 */
export async function sendCampaign(subject, message) {
  return apiEmail('/api/v1/campaigns/send', {
    method: 'POST',
    body: { subject, message },
  })
}
