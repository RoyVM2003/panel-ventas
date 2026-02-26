import { useState } from 'react'
import { Panel } from './Panel'
import { FormGroup } from './FormGroup'
import { Message } from './Message'
import { generateText, extractTextFromAIResponse } from '../services/aiService'

const AI_MODELS = [
  { value: 'generate', label: 'Automático (API /api/v1/generate)' },
  { value: 'ollama-0-5b', label: 'Ollama · qwen2.5 0.5B' },
  { value: 'ollama-1-5b', label: 'Ollama · qwen2.5 1.5B' },
  { value: 'mistral-tiny', label: 'Mistral · mistral-tiny' },
  { value: 'gemini-pro', label: 'Gemini · gemini-pro' },
]

export function AIAssistant({ body, onBodyAppend }) {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('generate')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: 'info' })
  const [output, setOutput] = useState('')

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
    setOutput('')
    setMessage({ text: 'Pidiendo sugerencia a la IA...', type: 'info' })
    try {
      const data = await generateText(p, model)
      const text = extractTextFromAIResponse(data)
      setOutput(text)
      const currentBody = typeof body === 'string' ? body : ''
      onBodyAppend?.(currentBody ? currentBody + '\n\n' + text : text)
      setMessage({
        text: 'Sugerencia recibida. Revisa y ajusta el texto antes de guardar/enviar.',
        type: 'ok',
      })
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
    <Panel title="Paso 2B · Ayuda IA para el texto (opcional)" icon="fas fa-robot">
      <FormGroup
        label="Describe la promoción o el público objetivo"
        id="aiPrompt"
      >
        <textarea
          id="aiPrompt"
          placeholder="Ej: Promo 2x1 en curso online de ventas para pymes mexicanas, tono cercano pero profesional..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </FormGroup>
      <FormGroup
        label="Proveedor / modelo"
        id="aiModel"
        hint="La IA te puede proponer asunto y cuerpo; luego los puedes ajustar antes de guardar/enviar."
      >
        <select id="aiModel" value={model} onChange={(e) => setModel(e.target.value)}>
          {AI_MODELS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </FormGroup>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleSuggest}
        disabled={loading}
      >
        <i className="fas fa-magic"></i> Sugerir asunto y texto
      </button>
      <Message text={message.text} type={message.type} className="mt-1" />
      {output && (
        <div className="ai-output" style={{ marginTop: '0.5rem' }}>
          {output}
        </div>
      )}
    </Panel>
  )
}
