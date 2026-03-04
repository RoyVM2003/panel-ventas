import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { HeaderBar } from '../components/HeaderBar'
import { ExcelImport } from '../components/ExcelImport'
import { CampaignForm } from '../components/CampaignForm'
import { AIAssistant } from '../components/AIAssistant'
import { SendCampaign } from '../components/SendCampaign'
import { Message } from '../components/Message'
import { listCampaigns } from '../services/excelService'

export function PanelPage() {
  const { email } = useAuth()
  const username = email ? email.split('@')[0] : 'Usuario'
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaignId, setSelectedCampaignId] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [globalMsg, setGlobalMsg] = useState({ text: '', type: 'info' })
  const [hasImportedExcel, setHasImportedExcel] = useState(false)
  const [hasUsedAI, setHasUsedAI] = useState(false)
  const [hasSentCampaign, setHasSentCampaign] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const addCampaign = useCallback((campaign) => {
    setCampaigns((prev) => {
      const id =
        campaign.id ??
        campaign.campaign_id ??
        campaign.id_campaign ??
        campaign.data?.id ??
        campaign.data?.id_campaign
      if (!id) return prev
      if (prev.some((c) => (c.id ?? c.campaign_id) === id)) return prev
      return [...prev, { id, name: campaign.name ?? campaign.subject, subject: campaign.subject, body: campaign.body }]
    })
  }, [])

  const updateCampaignInList = useCallback((id, { name, subject, body }) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        const cid = c.id ?? c.campaign_id ?? c.id_campaign
        if (String(cid ?? '') !== String(id ?? '')) return c
        return {
          ...c,
          name: name ?? c.name ?? c.nombre,
          subject: subject ?? c.subject,
          body: body ?? c.body,
        }
      })
    )
  }, [])

  const removeCampaign = useCallback((id) => {
    setCampaigns((prev) =>
      prev.filter((c) => String(c.id ?? c.campaign_id ?? c.id_campaign ?? '') !== String(id))
    )
  }, [])

  const handleBodyAppend = useCallback((newBody) => {
    setBody(newBody)
  }, [])

  // Cuando el usuario selecciona una campaña de la lista, rellenar asunto y mensaje
  useEffect(() => {
    if (!selectedCampaignId) {
      return
    }
    const cid = String(selectedCampaignId)
    const found = campaigns.find((c) => String(c.id ?? c.campaign_id ?? c.id_campaign ?? '') === cid)
    if (!found) return
    const s = found.subject ?? found.name ?? found.nombre ?? ''
    const b = found.body ?? found.message ?? ''
    if (typeof s === 'string') setSubject(s)
    if (typeof b === 'string') setBody(b)
    // Al cargar una campaña guardada, marcar Diseñar y Afinar con IA como hechos
    setHasUsedAI(true)
  }, [selectedCampaignId, campaigns])

  const getDeletedIds = () => {
    try {
      const raw = window.localStorage.getItem('panel_deleted_campaign_ids')
      if (!raw) return new Set()
      const arr = JSON.parse(raw)
      if (!Array.isArray(arr)) return new Set()
      return new Set(arr.map((v) => String(v)))
    } catch {
      return new Set()
    }
  }

  // Cargar campañas guardadas localmente (como respaldo) al entrar
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('panel_campaigns')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return
      const deletedIds = getDeletedIds()
      setCampaigns((prev) => {
        const base = parsed.filter((c) => !deletedIds.has(String(c.id ?? c.campaign_id ?? c.id_campaign ?? '')))
        if (!prev.length) return base
        const existingIds = new Set(prev.map((c) => String(c.id ?? c.campaign_id)))
        const merged = [...prev]
        base.forEach((c) => {
          const cid = String(c.id ?? c.campaign_id ?? '')
          if (!cid || existingIds.has(cid)) return
          merged.push(c)
          existingIds.add(cid)
        })
        return merged
      })
    } catch {
      // Ignorar errores de lectura
    }
  }, [])

  // Al entrar al panel, intentar cargar campañas ya existentes de la cuenta
  useEffect(() => {
    let cancelled = false
    const deletedIds = getDeletedIds()
    listCampaigns({ page: 1, limit: 50 })
      .then((items) => {
        if (cancelled) return
        if (!Array.isArray(items)) return
        const mapped = items
          .map((c) => {
            const id = c.id ?? c.campaign_id ?? c.id_campaign ?? c._id
            if (!id) return null
            if (deletedIds.has(String(id))) return null
            return {
              id,
              name: c.name ?? c.subject ?? c.nombre ?? c.compania ?? 'Campaña',
              subject: c.subject ?? c.name ?? c.nombre ?? '',
              body: c.body ?? c.message ?? '',
            }
          })
          .filter(Boolean)
        if (mapped.length) {
          setCampaigns((prev) => {
            const existingIds = new Set(prev.map((c) => String(c.id ?? c.campaign_id)))
            const merged = [...prev]
            mapped.forEach((c) => {
              const cid = String(c.id)
              if (!existingIds.has(cid)) {
                merged.push(c)
                existingIds.add(cid)
              }
            })
            return merged
          })
        }
      })
      .catch(() => {
        // Si falla, simplemente no mostramos campañas previas
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Guardar campañas en localStorage como respaldo entre sesiones
  useEffect(() => {
    try {
      window.localStorage.setItem('panel_campaigns', JSON.stringify(campaigns))
    } catch {
      // Si el almacenamiento falla (modo incógnito, etc.), simplemente lo ignoramos
    }
  }, [campaigns])

  return (
    <div id="app" className="app-dark-page">

      {/* Fondo decorativo — igual que el login */}
      <div className="app-dark-blob app-dark-blob--gold" />
      <div className="app-dark-blob app-dark-blob--teal" />
      <div className="app-dark-blob app-dark-blob--purple" />
      <div className="app-dark-dots" />
      <div className="app-dark-ring app-dark-ring--lg" />
      <div className="app-dark-ring app-dark-ring--sm" />

      <div className="app-dark-content wrap">
      <HeaderBar />

      {/* ── Welcome strip ── */}
      <div className="panel-welcome">
        <div className="panel-welcome-left">
          <div className="panel-welcome-label">
            <span className="panel-welcome-dot" />
            Panel activo
          </div>
          <h1 className="panel-welcome-title">
            Hola, <span className="panel-welcome-name">{username}</span> —<br />
            ¿qué enviamos hoy?
          </h1>
        </div>
        <div className="panel-welcome-tags">
          <div className={`panel-tag${hasImportedExcel ? ' panel-tag--done' : ''}`}>
            <i className={hasImportedExcel ? 'fas fa-check' : 'fas fa-users'}></i>
            Contactos{hasImportedExcel ? ' listos' : ' pendientes'}
          </div>
          <div className={`panel-tag${(subject?.trim() && body?.trim()) ? ' panel-tag--done' : ''}`}>
            <i className={(subject?.trim() && body?.trim()) ? 'fas fa-check' : 'fas fa-envelope'}></i>
            Campaña{(subject?.trim() && body?.trim()) ? ' lista' : ' pendiente'}
          </div>
          <div className={`panel-tag${hasSentCampaign ? ' panel-tag--done' : ''}`}>
            <i className={hasSentCampaign ? 'fas fa-check' : 'fas fa-rocket'}></i>
            {hasSentCampaign ? 'Enviada' : 'Por enviar'}
          </div>
        </div>
      </div>

      <nav className="app-steps" aria-label="Flujo para enviar una campaña">

        <button
          type="button"
          className={`app-step ${currentStep === 1 ? 'app-step--active' : ''} ${hasImportedExcel ? 'app-step--completed' : ''}`}
          onClick={() => { setCurrentStep(1); document.getElementById('step-1')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
        >
          <span className="app-step-badge">{hasImportedExcel ? <i className="fas fa-check" /> : '1'}</span>
          <div className="app-step-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="app-step-text">
            <strong>Importar contactos</strong>
            <small>Sube tu lista desde Excel</small>
          </div>
        </button>

        <button
          type="button"
          className={`app-step ${currentStep === 2 ? 'app-step--active' : ''} ${(subject?.trim() && body?.trim()) ? 'app-step--completed' : ''}`}
          onClick={() => { setCurrentStep(2); document.getElementById('step-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
        >
          <span className="app-step-badge">{(subject?.trim() && body?.trim()) ? <i className="fas fa-check" /> : '2'}</span>
          <div className="app-step-icon">
            <i className="fas fa-envelope-open-text"></i>
          </div>
          <div className="app-step-text">
            <strong>Diseñar campaña</strong>
            <small>Asunto y mensaje del correo</small>
          </div>
        </button>

        <button
          type="button"
          className={`app-step ${currentStep === '2b' ? 'app-step--active' : ''} ${hasUsedAI ? 'app-step--completed' : ''}`}
          onClick={() => { setCurrentStep('2b'); document.getElementById('step-2b')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
        >
          <span className="app-step-badge">{hasUsedAI ? <i className="fas fa-check" /> : <i className="fas fa-robot" />}</span>
          <div className="app-step-icon">
            <i className="fas fa-wand-magic-sparkles"></i>
          </div>
          <div className="app-step-text">
            <strong>Afinar con IA</strong>
            <small>Mejora tu mensaje con IA</small>
          </div>
        </button>

        <button
          type="button"
          className={`app-step ${currentStep === 3 ? 'app-step--active' : ''} ${hasSentCampaign ? 'app-step--completed' : ''}`}
          onClick={() => { setCurrentStep(3); document.getElementById('step-3')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
        >
          <span className="app-step-badge">{hasSentCampaign ? <i className="fas fa-check" /> : '3'}</span>
          <div className="app-step-icon">
            <i className="fas fa-rocket"></i>
          </div>
          <div className="app-step-text">
            <strong>Lanzar campaña</strong>
            <small>Envío masivo a tus contactos</small>
          </div>
        </button>

      </nav>
      <Message text={globalMsg.text} type={globalMsg.type} />
      <section id="step-1" className="app-section">
        <ExcelImport onImportSuccess={() => setHasImportedExcel(true)} />
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
        <AIAssistant body={body} onBodyAppend={handleBodyAppend} onSubjectChange={setSubject} onSuggestionApplied={() => setHasUsedAI(true)} />
      </section>
      <section id="step-3" className="app-section">
        <SendCampaign subject={subject} message={body} hasImportedExcel={hasImportedExcel} onSendSuccess={() => setHasSentCampaign(true)} />
      </section>
      </div>
    </div>
  )
}
