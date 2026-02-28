import { apiEmail } from './api'

/** POST /api/v1/excel/campaigns — Crear campaña. El backend exige también email, nombre, compañía; se envían valores de plantilla. */
export async function createCampaign({ name, subject, body }) {
  const n = name || subject || 'Campaña'
  return apiEmail('/api/v1/excel/campaigns', {
    method: 'POST',
    body: {
      name: n,
      subject: subject || n,
      body: body || '',
      email: 'plantilla-campana@noreply.local',
      nombre: n,
      compañía: n,
      compania: n,
      company: n,
    },
  })
}

/** GET /api/v1/excel/campaigns/{id} — Obtener una campaña por ID. */
export async function getCampaign(id) {
  return apiEmail(`/api/v1/excel/campaigns/${encodeURIComponent(id)}`)
}

/** PUT /api/v1/excel/campaigns/{id} — Actualizar campaña. Incluye email, nombre, compañía por si el backend los exige. */
export async function updateCampaign(id, { name, subject, body }) {
  const n = name || subject || 'Campaña'
  return apiEmail(`/api/v1/excel/campaigns/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: {
      name: n,
      subject: subject || n,
      body: body || '',
      email: 'plantilla-campana@noreply.local',
      nombre: n,
      compañía: n,
      compania: n,
      company: n,
    },
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
