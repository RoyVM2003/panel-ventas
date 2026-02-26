import { useState } from 'react'
import { Panel } from './Panel'
import { Message } from './Message'
import { sendCampaign } from '../services/campaignService'

export function SendCampaign({ campaignId }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: 'info' })

  const handleSend = async () => {
    const id = typeof campaignId === 'string' ? campaignId : campaignId?.value ?? ''
    if (!id) {
      setMessage({
        text: 'Selecciona una campaña existente o crea una nueva y guárdala antes de enviar.',
        type: 'err',
      })
      return
    }
    setLoading(true)
    setMessage({ text: 'Enviando...', type: 'info' })
    try {
      await sendCampaign(id)
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
        Se enviará la campaña seleccionada (o la que acabas de crear) a la base asociada. Revisa asunto y mensaje antes.
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
