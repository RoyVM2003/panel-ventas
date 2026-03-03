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
      setMessage({ text: 'Escribe el asunto y el contenido del correo.', type: 'err' })
      return
    }
    const id = selectedCampaignId || ''
    setLoading(true)
    setMessage({ text: id ? 'Actualizando...' : 'Creando campaña...', type: 'info' })
    try {
      const data = id
        ? await updateCampaign(id, { name: sub, subject: sub, body: b })
        : await createCampaign({ name: sub, subject: sub, body: b })
      const newId =
        data.id ??
        data.campaign_id ??
        data.id_campaign ??
        data.data?.id ??
        data.data?.id_campaign ??
        id
      setMessage({ text: 'Campaña guardada.', type: 'ok' })
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
      setMessage({ text: 'No se pudo guardar la campaña. ' + fullMsg, type: 'err' })
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
      // Marcar como eliminada también en localStorage para que no reaparezca
      try {
        const raw = window.localStorage.getItem('panel_deleted_campaign_ids')
        const arr = raw ? JSON.parse(raw) : []
        const list = Array.isArray(arr) ? arr : []
        if (!list.includes(id)) {
          list.push(id)
          window.localStorage.setItem('panel_deleted_campaign_ids', JSON.stringify(list))
        }
      } catch {
        // Ignorar errores de almacenamiento local
      }
    } catch (err) {
      const msg =
        err.data?.message ??
        err.data?.error ??
        (typeof err.data === 'object' ? JSON.stringify(err.data) : err.message)
      const text = String(msg || '')
      const isAlreadyDeleted =
        /no encontrada/i.test(text) || /ya está eliminada/i.test(text) || /ya esta eliminada/i.test(text)

      if (isAlreadyDeleted) {
        // Si el backend dice que no existe o ya está eliminada, la quitamos igual del panel
        setMessage({ text: 'Esa campaña ya no existía; la hemos quitado de la lista.', type: 'ok' })
        onCampaignDeleted?.(id)
        onSelectedCampaignIdChange?.('')
        onSubjectChange?.('')
        onBodyChange?.('')
        try {
          const raw = window.localStorage.getItem('panel_deleted_campaign_ids')
          const arr = raw ? JSON.parse(raw) : []
          const list = Array.isArray(arr) ? arr : []
          if (!list.includes(id)) {
            list.push(id)
            window.localStorage.setItem('panel_deleted_campaign_ids', JSON.stringify(list))
          }
        } catch {
          // Ignorar errores de almacenamiento local
        }
      } else {
        setMessage({ text: 'No se pudo eliminar. ' + text, type: 'err' })
      }
    } finally {
      setLoading(false)
    }
  }

  const list = Array.isArray(campaigns) ? campaigns : []
  const subVal = typeof subject === 'string' ? subject : subject?.value ?? ''
  const bodyVal = typeof body === 'string' ? body : body?.value ?? ''

  return (
    <Panel title="Paso 2 · Contenido de la campaña" icon="fas fa-envelope">
      <FormGroup
        label="Campañas guardadas"
        id="selCampaign"
        hint="Elige una campaña guardada para rellenar asunto y mensaje, o selecciona «Crear nueva campaña» para empezar desde cero."
      >
        <select
          id="selCampaign"
          value={selectedCampaignId || ''}
          onChange={(e) => {
            const value = e.target.value
            onSelectedCampaignIdChange?.(value)
            if (!value) {
              onSubjectChange?.('')
              onBodyChange?.('')
            }
          }}
        >
          <option value="">Crear nueva campaña</option>
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
          autoComplete="off"
          onChange={(e) => onSubjectChange?.(e.target.value)}
        />
      </FormGroup>
      <FormGroup label="Mensaje (cuerpo del correo)" id="campBody">
        <textarea
          id="campBody"
          placeholder="Escribe aquí el contenido del correo..."
          value={bodyVal}
          autoComplete="off"
          onChange={(e) => onBodyChange?.(e.target.value)}
        />
      </FormGroup>
      <p className="form-group hint">
        Para que tus campañas se puedan enviar, asegúrate de haber cargado al menos un archivo de contactos en el Paso 1.
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
