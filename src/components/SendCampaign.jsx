import { useState } from 'react'
import { Panel } from './Panel'
import { Message } from './Message'
import { sendCampaign } from '../services/campaignService'

export function SendCampaign({ subject, message: body, hasImportedExcel }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: 'info' })
  const safeSubject = (typeof subject === 'string' ? subject : '').trim()
  const safeBody = (typeof body === 'string' ? body : '').trim()

  const handleSend = async () => {
    if (!hasImportedExcel) {
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
      setMessage({ text: 'Envío solicitado correctamente.', type: 'ok' })
    } catch (err) {
      const msg =
        err.data?.message ||
        err.data?.error ||
        (err.data && typeof err.data === 'object' ? JSON.stringify(err.data) : err.message)
      setMessage({ text: 'Error al enviar: ' + msg, type: 'err' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Panel title="Paso 3 · Revisión final y envío" icon="fas fa-paper-plane">
      <p className="form-group hint">
        Se enviará el asunto y el mensaje definidos en el Paso 2 a todos los contactos activos que importaste en el Paso 1. Revisa bien el contenido antes de confirmar el envío.
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
        disabled={loading || !hasImportedExcel}
      >
        {!hasImportedExcel ? (
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
