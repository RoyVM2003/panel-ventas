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

      <div className="app-dark-content">
        <HeaderBar />

        {/* ══════════════════════════════════
            HERO — imagen completa con texto
            Reemplaza el src con tu imagen real
        ══════════════════════════════════ */}
        <div className="home-hero">
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80"
            className="home-hero-img"
            alt="equipo de trabajo"
          />
          <div className="home-hero-overlay" />
          <div className="home-hero-text">
            <div className="home-hero-eyebrow">OSDEMS · Email Marketing con IA</div>
            <h1 className="home-hero-h1">Lanza campañas<br />que convierten</h1>
            <p className="home-hero-desc">
              Importa contactos, diseña con IA y envía a toda tu lista en minutos.
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════
            SPLIT — Welcome (izq) + Imagen (der)
            Reemplaza el src con tu foto real
        ══════════════════════════════════ */}
        <div className="home-split">
          <div className="home-split-content">
            <div className="hw-eyebrow">
              <span className="hw-dot" />
              Panel activo
            </div>
            <h2 className="hw-title">
              Hola, <span className="hw-name">{username}</span><br />
              ¿qué enviamos hoy?
            </h2>
            <p className="hw-sub">
              Sigue los pasos para lanzar tu próxima campaña de email.
            </p>
            <div className="hw-stats-row">
              <div className={`hw-stat${hasImportedExcel ? ' hw-stat--done' : ''}`}>
                <div className="hw-stat-icon">
                  <i className={hasImportedExcel ? 'fas fa-check' : 'fas fa-users'} />
                </div>
                <div>
                  <div className="hw-stat-label">Contactos</div>
                  <div className="hw-stat-val">{hasImportedExcel ? 'Importados' : 'Pendientes'}</div>
                </div>
              </div>
              <div className={`hw-stat${(subject?.trim() && body?.trim()) ? ' hw-stat--done' : ''}`}>
                <div className="hw-stat-icon">
                  <i className={(subject?.trim() && body?.trim()) ? 'fas fa-check' : 'fas fa-envelope'} />
                </div>
                <div>
                  <div className="hw-stat-label">Campaña</div>
                  <div className="hw-stat-val">{(subject?.trim() && body?.trim()) ? 'Lista' : 'Pendiente'}</div>
                </div>
              </div>
              <div className={`hw-stat${hasSentCampaign ? ' hw-stat--done hw-stat--sent' : ''}`}>
                <div className="hw-stat-icon">
                  <i className={hasSentCampaign ? 'fas fa-check' : 'fas fa-rocket'} />
                </div>
                <div>
                  <div className="hw-stat-label">Envío</div>
                  <div className="hw-stat-val">{hasSentCampaign ? '¡Enviada!' : 'Por lanzar'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Imagen derecha — reemplaza src con tu imagen */}
          <div className="home-split-img">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
              className="home-split-photo"
              alt="profesional"
            />
            <div className="home-split-img-fade" />
          </div>
        </div>

        {/* ══════════════════════════════════
            FLUJO DE TRABAJO
        ══════════════════════════════════ */}
        <div className="workflow-root">

          {/* ── TIMELINE ── */}
          <div className="wrap">
            <nav className="stl-nav" aria-label="Pasos de la campaña">
              <button type="button"
                className={`stl-step${currentStep === 1 ? ' stl-step--active' : ''}${hasImportedExcel ? ' stl-step--done' : ''}`}
                onClick={() => { setCurrentStep(1); document.getElementById('step-1')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>
                <span className="stl-num">{hasImportedExcel ? <i className="fas fa-check" /> : '1'}</span>
                <span className="stl-label">Importar contactos</span>
              </button>
              <div className="stl-line" />
              <button type="button"
                className={`stl-step${currentStep === 2 ? ' stl-step--active' : ''}${(subject?.trim() && body?.trim()) ? ' stl-step--done' : ''}`}
                onClick={() => { setCurrentStep(2); document.getElementById('step-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>
                <span className="stl-num">{(subject?.trim() && body?.trim()) ? <i className="fas fa-check" /> : '2'}</span>
                <span className="stl-label">Diseñar campaña</span>
              </button>
              <div className="stl-line" />
              <button type="button"
                className={`stl-step${currentStep === '2b' ? ' stl-step--active' : ''}${hasUsedAI ? ' stl-step--done' : ''}`}
                onClick={() => { setCurrentStep('2b'); document.getElementById('step-2b')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>
                <span className="stl-num stl-num--ai">{hasUsedAI ? <i className="fas fa-check" /> : <i className="fas fa-wand-magic-sparkles" />}</span>
                <span className="stl-label">Afinar con IA</span>
              </button>
              <div className="stl-line" />
              <button type="button"
                className={`stl-step${currentStep === 3 ? ' stl-step--active' : ''}${hasSentCampaign ? ' stl-step--done' : ''}`}
                onClick={() => { setCurrentStep(3); document.getElementById('step-3')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>
                <span className="stl-num">{hasSentCampaign ? <i className="fas fa-check" /> : '3'}</span>
                <span className="stl-label">Lanzar campaña</span>
              </button>
            </nav>
            <Message text={globalMsg.text} type={globalMsg.type} />
          </div>

          {/* ── PASO 1: Importar contactos — imagen izquierda ── */}
          <div className="svb" id="step-1">
            <div className="svb-img">
              {/* Reemplaza src con tu imagen real */}
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=700&q=80" alt="contactos" />
              <div className="svb-img-overlay" />
              <div className="svb-img-badge">
                <span className="svb-step-num">01</span>
                <div>
                  <div className="svb-step-name">Importar</div>
                  <div className="svb-step-desc">contactos</div>
                </div>
              </div>
            </div>
            <div className="svb-body">
              <ExcelImport onImportSuccess={() => setHasImportedExcel(true)} />
            </div>
          </div>

          {/* ── PASO 2: Diseñar campaña — imagen derecha ── */}
          <div className="svb svb--rev" id="step-2">
            <div className="svb-img">
              {/* Reemplaza src con tu imagen real */}
              <img src="https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=700&q=80" alt="campaña" />
              <div className="svb-img-overlay" />
              <div className="svb-img-badge">
                <span className="svb-step-num">02</span>
                <div>
                  <div className="svb-step-name">Diseñar</div>
                  <div className="svb-step-desc">campaña</div>
                </div>
              </div>
            </div>
            <div className="svb-body">
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
            </div>
          </div>

          {/* ── IA: Afinar con IA — sección especial oscura full-width ── */}
          <div className="svb-ai" id="step-2b">
            <div className="svb-ai-img">
              {/* Reemplaza src con tu imagen real */}
              <img src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1400&q=80" alt="inteligencia artificial" />
              <div className="svb-ai-overlay" />
              <div className="svb-ai-header">
                <div className="svb-ai-eyebrow">
                  <i className="fas fa-wand-magic-sparkles" /> Inteligencia Artificial
                </div>
                <h2 className="svb-ai-title">Afina tu mensaje<br />con IA</h2>
                <p className="svb-ai-sub">Deja que la IA mejore tu campaña para maximizar conversiones.</p>
              </div>
            </div>
            <div className="svb-ai-form wrap">
              <AIAssistant body={body} onBodyAppend={handleBodyAppend} onSubjectChange={setSubject} onSuggestionApplied={() => setHasUsedAI(true)} />
            </div>
          </div>

          {/* ── PASO 3: Lanzar — imagen izquierda ── */}
          <div className="svb" id="step-3">
            <div className="svb-img">
              {/* Reemplaza src con tu imagen real */}
              <img src="https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=700&q=80" alt="lanzar campaña" />
              <div className="svb-img-overlay" />
              <div className="svb-img-badge">
                <span className="svb-step-num">03</span>
                <div>
                  <div className="svb-step-name">Lanzar</div>
                  <div className="svb-step-desc">campaña</div>
                </div>
              </div>
            </div>
            <div className="svb-body">
              <SendCampaign subject={subject} message={body} hasImportedExcel={hasImportedExcel} onSendSuccess={() => setHasSentCampaign(true)} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
