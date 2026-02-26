import { useState } from 'react'
import { Panel } from './Panel'
import { FormGroup } from './FormGroup'
import { Message } from './Message'
import { createCampaign } from '../services/campaignService'

export function CampaignForm({
  campaigns,
  selectedCampaignId,
  onSelectedCampaignIdChange,
  onCampaignsChange,
  subject,
  body,
  onSubjectChange,
  onBodyChange,
}) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: 'info' })

  const handleCreate = async () => {
    const sub = (typeof subject === 'string' ? subject : subject?.value ?? '').trim()
    const b = (typeof body === 'string' ? body : body?.value ?? '').trim()
    if (!sub || !b) {
      setMessage({ text: 'Rellena asunto y mensaje para crear la campaña.', type: 'err' })
      return
    }
    setLoading(true)
    setMessage({ text: 'Creando campaña...', type: 'info' })
    try {
      const data = await createCampaign({ name: sub, subject: sub, body: b })
      const id = data.id ?? data.campaign_id ?? data.data?.id
      setMessage({ text: 'Campaña creada correctamente.', type: 'ok' })
      onSubjectChange?.('')
      onBodyChange?.('')
      onCampaignsChange?.()
      if (id) onSelectedCampaignIdChange?.(String(id))
    } catch (err) {
      const msg =
        err.data?.message ||
        err.data?.error ||
        (err.data && typeof err.data === 'object' ? JSON.stringify(err.data) : err.message)
      setMessage({ text: 'Error al crear campaña: ' + msg, type: 'err' })
    } finally {
      setLoading(false)
    }
  }

  const list = Array.isArray(campaigns) ? campaigns : []
  const subVal = typeof subject === 'string' ? subject : subject?.value ?? ''
  const bodyVal = typeof body === 'string' ? body : body?.value ?? ''

  return (
    <Panel title="Paso 2 · Campaña / Mensaje" icon="fas fa-envelope">
      <FormGroup label="Usar campaña existente" id="selCampaign" hint="O deja «Crear nueva» y escribe asunto y mensaje.">
        <select
          id="selCampaign"
          value={selectedCampaignId || ''}
          onChange={(e) => onSelectedCampaignIdChange?.(e.target.value)}
        >
          <option value="">— Crear nueva campaña (rellena abajo) —</option>
          {list.map((c) => {
            const id = c.id ?? c.campaign_id
            const name = c.name ?? c.subject ?? 'Campaña #' + id
            return (
              <option key={id} value={id}>
                {name}
              </option>
            )
          })}
        </select>
      </FormGroup>
      <FormGroup label="Asunto del correo" id="campSubject">
        <input
          type="text"
          id="campSubject"
          placeholder="Ej: Novedades de este mes"
          value={subVal}
          onChange={(e) => onSubjectChange?.(e.target.value)}
        />
      </FormGroup>
      <FormGroup label="Mensaje (cuerpo del correo)" id="campBody">
        <textarea
          id="campBody"
          placeholder="Escribe aquí el contenido del correo..."
          value={bodyVal}
          onChange={(e) => onBodyChange?.(e.target.value)}
        />
      </FormGroup>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleCreate}
        disabled={loading}
      >
        <i className="fas fa-plus"></i> Crear / actualizar campaña
      </button>
      <Message text={message.text} type={message.type} className="mt-1" />
    </Panel>
  )
}
