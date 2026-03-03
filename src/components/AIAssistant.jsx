import { useState } from 'react'
import { Panel } from './Panel'
import { FormGroup } from './FormGroup'
import { Message } from './Message'
import { generateText, getSubjectAndBodyFromAIResponse } from '../services/aiService'

export function AIAssistant({ body, onBodyAppend, onSubjectChange }) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: 'info' })
  const [suggestion, setSuggestion] = useState({ subject: '', body: '' })

  const handleSuggest = async () => {
    const p = prompt.trim()
    if (!p) {
      setMessage({
        text: 'Escribe primero una breve descripción de la promo o del público objetivo.',
        type: 'err',
      })
      return
    }
    setLoading(true)
    setSuggestion({ subject: '', body: '' })
    setMessage({ text: 'Pidiendo sugerencia a la IA...', type: 'info' })
    try {
      // Llama al backend real: POST /api/v1/ai/campaign-suggestion
      const data = await generateText(p)
      const { subject: suggestedSubject, body: suggestedBody } = getSubjectAndBodyFromAIResponse(data)
      setSuggestion({
        subject: suggestedSubject || '',
        body: suggestedBody || '',
      })
      if (suggestedSubject) onSubjectChange?.(suggestedSubject)
      if (suggestedBody) {
        const currentBody = typeof body === 'string' ? body : ''
        onBodyAppend?.(currentBody ? currentBody + '\n\n' + suggestedBody : suggestedBody)
      }
      if (suggestedSubject || suggestedBody) {
        setMessage({
          text: 'Sugerencia aplicada en el Paso 2 (arriba). Revisa allí el asunto y el mensaje del correo.',
          type: 'ok',
        })
      } else {
        setMessage({
          text: 'El servidor respondió pero no se pudo extraer asunto ni mensaje. Escribe el texto manualmente en el Paso 2 o revisa el formato de respuesta del backend.',
          type: 'err',
        })
      }
    } catch (err) {
      const msg =
        err.data?.message ||
        err.data?.error ||
        (err.data && typeof err.data === 'object' ? JSON.stringify(err.data) : err.message)
      setMessage({ text: 'Error al pedir sugerencia IA: ' + msg, type: 'err' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Panel title="Paso 2B · Mejora el texto con IA (opcional)" icon="fas fa-robot">
      <FormGroup
        label="Describe la promoción o el público objetivo"
        id="aiPrompt"
      >
        <textarea
          id="aiPrompt"
          placeholder="Ej: Promoción de renovación anual con descuento para clientes actuales, tono cercano y profesional."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </FormGroup>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleSuggest}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="btn-spinner" aria-hidden="true" /> Pidiendo sugerencia...
          </>
        ) : (
          <>
            <i className="fas fa-magic"></i> Sugerir asunto y texto
          </>
        )}
      </button>
      <Message text={message.text} type={message.type} className="mt-1" />
      {(suggestion.subject || suggestion.body) && (
        <div className="ai-suggestion-card">
          <div className="ai-suggestion-header">
            <span className="ai-suggestion-title">Propuesta de la IA</span>
            <span className="ai-suggestion-subtitle">
              Se ha aplicado en el Paso 2 (arriba). Revisa allí el asunto y el mensaje.
            </span>
          </div>
          {suggestion.subject && (
            <p className="ai-suggestion-subject">
              <span>Asunto sugerido:</span> {suggestion.subject}
            </p>
          )}
          {suggestion.body && (
            <div className="ai-suggestion-body">
              <span className="ai-suggestion-label">Mensaje sugerido:</span>
              <pre>{suggestion.body}</pre>
            </div>
          )}
        </div>
      )}
    </Panel>
  )
}
