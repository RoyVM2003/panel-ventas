import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { HeaderBar } from '../components/HeaderBar'
import { ExcelImport } from '../components/ExcelImport'
import { CampaignForm } from '../components/CampaignForm'
import { AIAssistant } from '../components/AIAssistant'
import { SendCampaign } from '../components/SendCampaign'
import { Message } from '../components/Message'
import { MascotAssistant } from '../components/MascotAssistant'
import { listCampaigns } from '../services/excelService'
import { useScrollReveal } from '../hooks/useScrollReveal'

export function PanelPage() {
  useScrollReveal()
  const { email } = useAuth()
  const username = email ? email.split('@')[0] : 'Usuario'
  const [designAiTab, setDesignAiTab] = useState('design')
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaignId, setSelectedCampaignId] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [globalMsg, setGlobalMsg] = useState({ text: '', type: 'info' })
  const [hasImportedExcel, setHasImportedExcel] = useState(false)
  const [hasUsedAI, setHasUsedAI] = useState(false)
  const [hasSentCampaign, setHasSentCampaign] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const scrollToSteps = useCallback(() => {
    document.getElementById('step-1')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const hasSubjectAndBody = !!(subject && subject.trim() && body && body.trim())
  let mascotStep = 1
  if (!hasImportedExcel) {
    mascotStep = 1
  } else if (!hasSubjectAndBody) {
    mascotStep = 2
  } else {
    mascotStep = 3
  }

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

      <div className="app-dark-content">

        {/* Hero: imagen de fondo — referencia Unsplash "Modern office" (uso libre) https://unsplash.com/photos/6870744d04b2 */}
        <div className="home-hero">
          <div className="home-hero-bg">
            <img
              src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=90"
              className="home-hero-img"
              alt=""
            />
          </div>
          <div className="home-hero-overlay" />

          <div className="home-hero-nav">
            <HeaderBar />
          </div>

          <div className="home-hero-greeting reveal reveal-slow reveal-from-left">
            <div className="home-hero-greeting-top">
              <span className="home-hero-greeting-label">Panel activo</span>
            </div>
            <div className="home-hero-greeting-name">
              Hola, <span className="hw-name-light">{username}</span>
            </div>
            <div className="home-hero-greeting-sub">preparado para la próxima campaña</div>
          </div>

          <div className="home-hero-text reveal reveal-slow reveal-delay-1">
            <div className="home-hero-eyebrow">CONFIGURA TU SUEÑO</div>
            <h1 className="home-hero-h1">
              Email marketing que habla
              <br />
              el idioma del dinero
            </h1>
            <p className="home-hero-desc">
              Ahorra tiempo a tu equipo, protege tu presupuesto y lanza campañas
              que venden como un auto premium, no como un cupón de comida rápida.
            </p>
          </div>

          <MascotAssistant
            size="lg"
            variant="hero"
            message={
              <>
                Te acompaño en cada paso del panel.
                {' '}
                <button
                  type="button"
                  className="mascot-cta-link"
                  onClick={scrollToSteps}
                >
                  Ver instrucciones ↓
                </button>
              </>
            }
          />
        </div>

        {/* Strip de pasos + KPI (estilo Gleeds/Ciklum) */}
        <div className="workflow-root">
          <div className="wf-strip reveal">
            <div className="wf-strip-inner">
              <h2 className="wf-strip-title">Tu campaña, paso a paso</h2>
              <nav className="wf-stl" aria-label="Pasos de la campaña">
                <button type="button"
                  className={`wf-stl-step${currentStep === 1 ? ' wf-stl-step--active' : ''}${hasImportedExcel ? ' wf-stl-step--done' : ''}`}
                  onClick={() => { setCurrentStep(1); document.getElementById('step-1')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>
                  <span className="wf-stl-num">{hasImportedExcel ? <i className="fas fa-check" /> : '1'}</span>
                  <span className="wf-stl-label">Importar</span>
                </button>
                <div className="wf-stl-line" />
                <button type="button"
                  className={`wf-stl-step${(currentStep === 2 || currentStep === '2b') ? ' wf-stl-step--active' : ''}${(subject?.trim() && body?.trim()) ? ' wf-stl-step--done' : ''}`}
                  onClick={() => { setCurrentStep(2); document.getElementById('step-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>
                  <span className="wf-stl-num">{(subject?.trim() && body?.trim()) ? <i className="fas fa-check" /> : '2'}</span>
                  <span className="wf-stl-label">Diseñar + IA</span>
                </button>
                <div className="wf-stl-line" />
                <button type="button"
                  className={`wf-stl-step${currentStep === 3 ? ' wf-stl-step--active' : ''}${hasSentCampaign ? ' wf-stl-step--done' : ''}`}
                  onClick={() => { setCurrentStep(3); document.getElementById('step-3')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>
                  <span className="wf-stl-num">{hasSentCampaign ? <i className="fas fa-check" /> : '3'}</span>
                  <span className="wf-stl-label">Lanzar</span>
                </button>
              </nav>
            </div>
          </div>

          {/* ── Cards de trabajo ── */}
          <div className="wf-cards">
            <div className="wrap">
              <Message text={globalMsg.text} type={globalMsg.type} />

              <div className="wf-grid">
                {/* Paso 1 */}
                <section
                  id="step-1"
                  className={`app-section reveal reveal-delay-1${currentStep !== 1 ? ' app-section--faded' : ''}`}
                >
                  {mascotStep === 1 && (
                    <div className="mascot-step mascot-step--1">
                      <MascotAssistant
                        size="sm"
                        variant="inline"
                        message="Empieza aquí: este Excel define a quién vas a escribir."
                      />
                    </div>
                  )}
                  <ExcelImport onImportSuccess={() => setHasImportedExcel(true)} />
                </section>

                {/* Paso 2 + 2b — tarjeta con tabs */}
                <section
                  id="step-2"
                  className={`app-section reveal reveal-delay-2${(currentStep !== 2 && currentStep !== '2b') ? ' app-section--faded' : ''}`}
                >
                  {mascotStep === 2 && (
                    <div className="mascot-step mascot-step--2">
                      <MascotAssistant
                        size="sm"
                        variant="inline"
                        message="Estamos en el Paso 2: diseña tu mensaje y, si quieres, afínalo con IA."
                      />
                    </div>
                  )}
                  <div className="cstab-root">
                    <div className="cstab-bar">
                      <button type="button"
                        className={`cstab${designAiTab === 'design' ? ' cstab--active' : ''}`}
                        onClick={() => setDesignAiTab('design')}>
                        <i className="fas fa-envelope-open-text" /> Diseñar campaña
                      </button>
                      <button type="button"
                        className={`cstab${designAiTab === 'ai' ? ' cstab--active' : ''}`}
                        onClick={() => setDesignAiTab('ai')}>
                        <i className="fas fa-wand-magic-sparkles" /> Afinar con IA
                      </button>
                    </div>
                    <div className={`cstab-pane${designAiTab === 'design' ? ' cstab-pane--active' : ''}`}>
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
                    <div className={`cstab-pane${designAiTab === 'ai' ? ' cstab-pane--active' : ''}`}>
                      <AIAssistant body={body} onBodyAppend={handleBodyAppend} onSubjectChange={setSubject} onSuggestionApplied={() => setHasUsedAI(true)} />
                    </div>
                  </div>
                </section>
              </div>

              <section
                id="step-3"
                className={`app-section reveal${currentStep !== 3 ? ' app-section--faded' : ''}`}
              >
                {mascotStep === 3 && (
                  <div className="mascot-step mascot-step--3">
                    <MascotAssistant
                      size="sm"
                      variant="warning"
                      message={hasImportedExcel
                        ? 'Revisa asunto y mensaje. Cuando estés listo, lanza tu campaña premium.'
                        : 'Importa tu Excel en el Paso 1 para desbloquear el envío.'}
                    />
                  </div>
                )}
                <SendCampaign subject={subject} message={body} hasImportedExcel={hasImportedExcel} onSendSuccess={() => setHasSentCampaign(true)} />
              </section>

              {/* CTA final (estilo Ciklum) */}
              <div className="wf-panel-cta reveal">
                <p className="wf-panel-cta-text">¿Listo para la siguiente campaña?</p>
                <button
                  type="button"
                  className="btn wf-panel-cta-btn"
                  onClick={() => { setCurrentStep(1); document.getElementById('step-1')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                >
                  Comenzar de nuevo
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
