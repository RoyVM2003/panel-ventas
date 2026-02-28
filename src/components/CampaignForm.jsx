import { useState } from 'react'
import { Panel } from './Panel'
import { FormGroup } from './FormGroup'
import { Message } from './Message'
import { createCampaign, updateCampaign, deleteCampaign } from '../services/campaignService'

export function CampaignForm({
  campaigns,
  selectedCampaignId,
  onSelectedCampaignIdChange,
  onCampaignCreated,
  onCampaignUpdated,
  onCampaignDeleted,
  subject,
  body,
  onSubjectChange,
  onBodyChange,
}) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: 'info' })

  const handleSave = async () => {
    const sub = (typeof subject === 'string' ? subject : subject?.value ?? '').trim()
    const b = (typeof body === 'string' ? body : body?.value ?? '').trim()
    if (!sub || !b) {
      setMessage({ text: 'Rellena asunto y mensaje.', type: 'err' })
      return
    }
    const id = selectedCampaignId || ''
    setLoading(true)
    setMessage({ text: id ? 'Actualizando...' : 'Creando campaña...', type: 'info' })
    try {
      const data = id
        ? await updateCampaign(id, { name: sub, subject: sub, body: b })
        : await createCampaign({ name: sub, subject: sub, body: b })
      const newId = data.id ?? data.campaign_id ?? data.data?.id ?? id
      setMessage({ text: id ? 'Campaña actualizada.' : 'Campaña creada correctamente.', type: 'ok' })
      if (id) {
        onCampaignUpdated?.(id, { name: sub, subject: sub, body: b })
      } else if (newId) {
        onCampaignCreated?.({ ...data, id: newId, name: sub, subject: sub, body: b })
        onSelectedCampaignIdChange?.(String(newId))
      }
    } catch (err) {
      const msg =
        err.data?.message ||
        err.data?.error ||
        (err.data && typeof err.data === 'object' ? JSON.stringify(err.data) : err.message)
      const fullMsg = String(msg ?? '')
      const isBackendRequiredFields =
        /email|nombre|compañía|compania/i.test(fullMsg) && /requerido|required|campo/i.test(fullMsg)
      const needsExcel =
        /excel|datos válidos|válidos|validos|importar|contactos/i.test(fullMsg)
      let text = (id ? 'Error al actualizar: ' : 'Error al crear campaña: ') + fullMsg
      if (needsExcel) {
        text = `Error: ${fullMsg} Primero importa un Excel con datos válidos en el Paso 1 (columnas que pida el backend, p. ej. email, nombre).`
      } else if (isBackendRequiredFields) {
        text = `Error: ${fullMsg} El backend puede exigir tener contactos importados desde Excel (Paso 1). Revisa https://osdemsventas.site/api-docs o contacta al equipo del backend.`
      }
      setMessage({ text, type: 'err' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const id = selectedCampaignId || ''
    if (!id) return
    if (!window.confirm('¿Eliminar esta campaña?')) return
    setLoading(true)
    setMessage({ text: '', type: 'info' })
    try {
      await deleteCampaign(id)
      setMessage({ text: 'Campaña eliminada.', type: 'ok' })
      onCampaignDeleted?.(id)
      onSelectedCampaignIdChange?.('')
      onSubjectChange?.('')
      onBodyChange?.('')
    } catch (err) {
      const msg = err.data?.message ?? err.data?.error ?? (typeof err.data === 'object' ? JSON.stringify(err.data) : err.message)
      setMessage({ text: 'Error al eliminar: ' + msg, type: 'err' })
    } finally {
      setLoading(false)
    }
  }

  const list = Array.isArray(campaigns) ? campaigns : []
  const subVal = typeof subject === 'string' ? subject : subject?.value ?? ''
  const bodyVal = typeof body === 'string' ? body : body?.value ?? ''

  return (
    <Panel title="Paso 2 · Campaña / Mensaje" icon="fas fa-envelope">
      <FormGroup label="Tus campañas guardadas (solo las que creas aquí)" id="selCampaign" hint="Escribe asunto y mensaje abajo y pulsa «Crear campaña» para guardar una. En el desplegable solo aparecen las que tú creas en esta sesión.">
        <select
          id="selCampaign"
          value={selectedCampaignId || ''}
          onChange={(e) => onSelectedCampaignIdChange?.(e.target.value)}
        >
          <option value="">— Crear nueva campaña (rellena abajo) —</option>
          {list.map((c) => {
            const cid = c.id ?? c.campaign_id
            const name = ((c.name ?? c.subject) || 'Campaña').slice(0, 60) || 'Campaña #' + cid
            return (
              <option key={cid} value={cid}>
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
      <p className="form-group hint">
        Para poder guardar la campaña, el backend puede exigir tener contactos importados desde un Excel válido en el Paso 1.
      </p>
      <div className="form-group" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleSave}
          disabled={loading}
        >
          <i className="fas fa-save"></i> {selectedCampaignId ? 'Actualizar campaña' : 'Crear campaña'}
        </button>
        {selectedCampaignId && (
          <button
            type="button"
            className="btn"
            style={{ background: 'var(--err, #c00)', color: '#fff' }}
            onClick={handleDelete}
            disabled={loading}
          >
            <i className="fas fa-trash"></i> Eliminar campaña
          </button>
        )}
      </div>
      <Message text={message.text} type={message.type} className="mt-1" />
    </Panel>
  )
}
