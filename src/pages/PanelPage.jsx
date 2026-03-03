import { useState, useCallback, useEffect } from 'react'
import { HeaderBar } from '../components/HeaderBar'
import { ExcelImport } from '../components/ExcelImport'
import { CampaignForm } from '../components/CampaignForm'
import { AIAssistant } from '../components/AIAssistant'
import { SendCampaign } from '../components/SendCampaign'
import { Message } from '../components/Message'
import { getCampaign } from '../services/campaignService'

export function PanelPage() {
  // Solo campañas que TÚ creas en esta sesión (no se carga la lista del backend para no mezclar contactos)
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaignId, setSelectedCampaignId] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [globalMsg, setGlobalMsg] = useState({ text: '', type: 'info' })

  const addCampaign = useCallback((campaign) => {
    setCampaigns((prev) => {
      const id = campaign.id ?? campaign.campaign_id ?? campaign.data?.id
      if (!id) return prev
      if (prev.some((c) => (c.id ?? c.campaign_id) === id)) return prev
      return [...prev, { id, name: campaign.name ?? campaign.subject, subject: campaign.subject, body: campaign.body }]
    })
  }, [])

  const updateCampaignInList = useCallback((id, { name, subject, body }) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        const cid = c.id ?? c.campaign_id
        return cid === id ? { ...c, name: name ?? c.name, subject: subject ?? c.subject, body: body ?? c.body } : c
      })
    )
  }, [])

  const removeCampaign = useCallback((id) => {
    setCampaigns((prev) => prev.filter((c) => (c.id ?? c.campaign_id) !== id))
  }, [])

  // Al elegir una campaña existente, cargar su asunto y cuerpo
  useEffect(() => {
    if (!selectedCampaignId) return
    let cancelled = false
    getCampaign(selectedCampaignId)
      .then((c) => {
        if (cancelled) return
        const s = c.subject ?? c.name ?? ''
        const b = c.body ?? c.message ?? ''
        setSubject(typeof s === 'string' ? s : '')
        setBody(typeof b === 'string' ? b : '')
      })
      .catch(() => {
        if (!cancelled) {
          setSubject('')
          setBody('')
        }
      })
    return () => { cancelled = true }
  }, [selectedCampaignId])

  const handleBodyAppend = useCallback((newBody) => {
    setBody(newBody)
  }, [])

  return (
    <div id="app" className="app-visible">
      <HeaderBar />
      <nav className="app-steps" aria-label="Flujo para enviar una campaña">
        <button
          type="button"
          className="app-step"
          onClick={() => document.getElementById('step-1')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          <span className="app-step-number">1</span>
          <span className="app-step-text">
            Importar contactos
            <small>Sube tu lista de clientes desde Excel</small>
          </span>
        </button>
        <button
          type="button"
          className="app-step"
          onClick={() => document.getElementById('step-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          <span className="app-step-number">2</span>
          <span className="app-step-text">
            Diseñar campaña
            <small>Define el mensaje que quieres que recuerden</small>
          </span>
        </button>
        <button
          type="button"
          className="app-step"
          onClick={() => document.getElementById('step-2b')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          <span className="app-step-number">2B</span>
          <span className="app-step-text">
            Afinar con IA
            <small>Pulimos el texto para que suene mejor</small>
          </span>
        </button>
        <button
          type="button"
          className="app-step"
          onClick={() => document.getElementById('step-3')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          <span className="app-step-number">3</span>
          <span className="app-step-text">
            Enviar campaña
            <small>Un clic y tu promo sale a todos</small>
          </span>
        </button>
      </nav>
      <Message text={globalMsg.text} type={globalMsg.type} />
      <section id="step-1" className="app-section">
        <ExcelImport />
      </section>
      <section id="step-2" className="app-section">
        <CampaignForm
          campaigns={campaigns}
          selectedCampaignId={selectedCampaignId}
          onSelectedCampaignIdChange={setSelectedCampaignId}
          onCampaignCreated={addCampaign}
          onCampaignUpdated={updateCampaignInList}
          onCampaignDeleted={removeCampaign}
          subject={subject}
          body={body}
          onSubjectChange={setSubject}
          onBodyChange={setBody}
        />
      </section>
      <section id="step-2b" className="app-section">
        <AIAssistant body={body} onBodyAppend={handleBodyAppend} onSubjectChange={setSubject} />
      </section>
      <section id="step-3" className="app-section">
        <SendCampaign subject={subject} message={body} />
      </section>
    </div>
  )
}
