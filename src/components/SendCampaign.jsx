import { useState } from 'react'
import { Panel } from './Panel'
import { Message } from './Message'
import { sendCampaign } from '../services/campaignService'

export function SendCampaign({ subject, message: body, hasImportedExcel, onSendSuccess }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: 'info' })
  const safeSubject = (typeof subject === 'string' ? subject : '').trim()
  const safeBody = (typeof body === 'string' ? body : '').trim()
  // Solo permitir envío si en esta sesión se importó un Excel (evitar envío sin lista)
  const canSend = hasImportedExcel === true

  const handleSend = async () => {
    if (!canSend) {
      setMessage({
        text: 'Primero importa un Excel en el Paso 1. Solo se enviará a los contactos de ese archivo.',
        type: 'err',
      })
      return
    }
    if (!safeSubject || !safeBody) {
      setMessage({
        text: 'Escribe asunto y mensaje en el Paso 2 antes de enviar.',
        type: 'err',
      })
      return
    }
    setLoading(true)
    setMessage({ text: 'Enviando...', type: 'info' })
    try {
      await sendCampaign(safeSubject, safeBody)
      setMessage({ text: 'Listo. Tu campaña se ha puesto en cola y se enviará a tus contactos en breve.', type: 'ok' })
      onSendSuccess?.()
    } catch (err) {
      const msg =
        err.data?.message ||
        err.data?.error ||
        (err.data && typeof err.data === 'object' ? JSON.stringify(err.data) : err.message)
      setMessage({ text: 'No se pudo enviar la campaña. ' + msg, type: 'err' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Panel title="Paso 3 · Revisión final y envío" icon="fas fa-paper-plane">
      {!canSend && (
        <div className="msg err" role="alert" style={{ marginBottom: '1rem' }}>
          <strong>No puedes enviar todavía.</strong> Primero importa un archivo Excel en el Paso 1 (Importar contactos). El envío solo irá a los correos de ese archivo.
        </div>
      )}
      <p className="form-group hint">
        Se enviará el asunto y el mensaje del Paso 2 solo a los contactos del Excel que importaste en el Paso 1. Sin Excel importado no se puede enviar. Revisa el contenido antes de confirmar.
      </p>
      <div className="email-preview">
        <div className="email-preview-header">
          <span className="email-preview-label">Vista previa del correo</span>
          <span className="email-preview-small">Así lo verá tu cliente en su bandeja de entrada</span>
        </div>
        <div className="email-preview-body">
          <p className="email-preview-subject">
            <span>Asunto:</span> {safeSubject || <em>Sin asunto (rellénalo en el Paso 2)</em>}
          </p>
          <div className="email-preview-message">
            {safeBody ? (
              <pre>{safeBody}</pre>
            ) : (
              <em>Escribe el mensaje en el Paso 2 o usa la ayuda de IA para generarlo.</em>
            )}
          </div>
        </div>
      </div>
      <button
        type="button"
        className="btn"
        onClick={handleSend}
        disabled={loading || !canSend}
      >
        {!canSend ? (
          <>
            <i className="fas fa-lock"></i> Importa Excel primero (Paso 1)
          </>
        ) : loading ? (
          <>
            <span className="btn-spinner" aria-hidden="true" /> Enviando...
          </>
        ) : (
          <>
            <i className="fas fa-paper-plane"></i> Enviar campaña
            <span
              className="help-icon"
              title="Solo se enviará a los contactos del Excel que importaste en el Paso 1."
            >
              ?
            </span>
          </>
        )}
      </button>
      <Message text={message.text} type={message.type} className="mt-1" />
    </Panel>
  )
}
