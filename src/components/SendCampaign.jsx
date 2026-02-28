import { useState } from 'react'
import { Panel } from './Panel'
import { Message } from './Message'
import { sendCampaign } from '../services/campaignService'

export function SendCampaign({ subject, message: body }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: 'info' })

  const handleSend = async () => {
    const sub = (typeof subject === 'string' ? subject : '').trim()
    const msg = (typeof body === 'string' ? body : '').trim()
    if (!sub || !msg) {
      setMessage({
        text: 'Escribe asunto y mensaje en el Paso 2 antes de enviar.',
        type: 'err',
      })
      return
    }
    setLoading(true)
    setMessage({ text: 'Enviando...', type: 'info' })
    try {
      await sendCampaign(sub, msg)
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
    <Panel title="Paso 3 · Enviar campaña" icon="fas fa-paper-plane">
      <p className="form-group hint">
        Se enviará el asunto y mensaje que escribiste en el Paso 2 a todos los contactos activos (los que importaste en el Paso 1 con el Excel). Si no has importado contactos, el envío no tendrá destinatarios. Revisa antes de enviar.
      </p>
      <button
        type="button"
        className="btn"
        onClick={handleSend}
        disabled={loading}
      >
        <i className="fas fa-paper-plane"></i> Enviar campaña
      </button>
      <Message text={message.text} type={message.type} className="mt-1" />
    </Panel>
  )
}
