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
  const [showSentOverlay, setShowSentOverlay] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const scrollToSteps = useCallback(() => {
    document.getElementById('step-1')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const hasSubjectAndBody = !!(subject && subject.trim() && body && body.trim())
  const canUseStep2 = hasImportedExcel
  const canUseStep3 = hasImportedExcel && hasSubjectAndBody
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
        <div className={`workflow-root${hasSentCampaign ? ' workflow-root--sent' : ''}`}>
          {hasSentCampaign && showSentOverlay && (
            <div className="wf-sent-overlay" aria-live="polite">
              <button
                type="button"
                className="wf-sent-close"
                onClick={() => { setShowSentOverlay(false); setHasSentCampaign(false) }}
                aria-label="Cerrar mensaje de campaña enviada"
              >
                <i className="fas fa-times" />
              </button>
              <div className="wf-sent-mascot">
                <MascotAssistant
                  size="lg"
                  variant="inline"
                  message="¡Listo! Tu campaña se ha enviado. Los correos llegarán a los contactos de tu Excel."
                />
              </div>
            </div>
          )}
          <div className={`wf-strip reveal${hasSentCampaign ? ' wf-strip--faded' : ''}`}>
            <div className="wf-strip-inner">
              <h2 className="wf-strip-title">Tu campaña, paso a paso</h2>
              <nav className="wf-stl" aria-label="Pasos de la campaña">
                <button type="button"
                  className={`wf-stl-step${currentStep === 1 ? ' wf-stl-step--active' : ''}${hasImportedExcel ? ' wf-stl-step--done' : ''}`}
                  onClick={() => setCurrentStep(1)}>
                  <span className="wf-stl-num">{hasImportedExcel ? <i className="fas fa-check" /> : '1'}</span>
                  <span className="wf-stl-label">Importar</span>
                </button>
                <div className="wf-stl-line" />
                <button type="button"
                  className={`wf-stl-step${(currentStep === 2 || currentStep === '2b') ? ' wf-stl-step--active' : ''}${(subject?.trim() && body?.trim()) ? ' wf-stl-step--done' : ''}`}
                  onClick={() => {
                    if (!canUseStep2) {
                      setGlobalMsg({ text: 'Primero completa el Paso 1 — Importar contactos.', type: 'err' })
                      return
                    }
                    setCurrentStep(2)
                  }}>
                  <span className="wf-stl-num">{(subject?.trim() && body?.trim()) ? <i className="fas fa-check" /> : '2'}</span>
                  <span className="wf-stl-label">Diseñar + IA</span>
                </button>
                <div className="wf-stl-line" />
                <button type="button"
                  className={`wf-stl-step${currentStep === 3 ? ' wf-stl-step--active' : ''}${hasSentCampaign ? ' wf-stl-step--done' : ''}`}
                  onClick={() => {
                    if (!canUseStep3) {
                      const msg = !canUseStep2
                        ? 'Primero completa el Paso 1 — Importar contactos.'
                        : 'Completa asunto y mensaje en el Paso 2 antes de enviar.'
                      setGlobalMsg({ text: msg, type: 'err' })
                      return
                    }
                    setCurrentStep(3)
                  }}>
                  <span className="wf-stl-num">{hasSentCampaign ? <i className="fas fa-check" /> : '3'}</span>
                  <span className="wf-stl-label">Lanzar</span>
                </button>
              </nav>
            </div>
          </div>

          {/* ── Carrusel: un paso a la vez ── */}
          <div className={`wf-cards wf-cards--carousel${hasSentCampaign ? ' wf-cards--faded' : ''}`}>
            <div className="wrap">
              <Message text={globalMsg.text} type={globalMsg.type} />

              <div className="wf-carousel">
                {/* Asistente fijo (grande), mensaje según paso */}
                <div className="wf-carousel-mascot">
                  <MascotAssistant
                    size="lg"
                    variant="inline"
                    message={
                      currentStep === 1
                        ? 'Empieza aquí: sube tu Excel y define a quién vas a escribir.'
                        : currentStep === 2
                          ? 'Diseña tu mensaje y, si quieres, afínalo con IA.'
                          : hasImportedExcel
                            ? 'Revisa asunto y mensaje. Cuando estés listo, lanza tu campaña.'
                            : 'Importa tu Excel en el Paso 1 para poder enviar.'
                    }
                  />
                </div>

                <div className="wf-carousel-slide">
                  {currentStep === 1 && (
                    <section id="step-1" className="wf-carousel-pane reveal">
                      <ExcelImport onImportSuccess={() => setHasImportedExcel(true)} />
                    </section>
                  )}
                  {currentStep === 2 && (
                    <section id="step-2" className="wf-carousel-pane reveal">
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
                            disabled={!hasImportedExcel}
                          />
                        </div>
                        <div className={`cstab-pane${designAiTab === 'ai' ? ' cstab-pane--active' : ''}`}>
                          <AIAssistant body={body} onBodyAppend={handleBodyAppend} onSubjectChange={setSubject} onSuggestionApplied={() => setHasUsedAI(true)} />
                        </div>
                      </div>
                    </section>
                  )}
                  {currentStep === 3 && (
                    <section id="step-3" className="wf-carousel-pane reveal">
                      <SendCampaign subject={subject} message={body} hasImportedExcel={hasImportedExcel} onSendSuccess={() => { setHasSentCampaign(true); setShowSentOverlay(true) }} />
                    </section>
                  )}
                </div>

                {/* Navegación inferior: puntos + Anterior / Siguiente */}
                <nav className="wf-carousel-nav" aria-label="Navegación entre pasos">
                  <div className="wf-carousel-dots">
                    {[1, 2, 3].map((step) => (
                      <button
                        key={step}
                        type="button"
                        className={`wf-carousel-dot${currentStep === step ? ' wf-carousel-dot--active' : ''}${step === 1 ? (hasImportedExcel ? ' wf-carousel-dot--done' : '') : step === 2 ? (hasSubjectAndBody ? ' wf-carousel-dot--done' : '') : (hasSentCampaign ? ' wf-carousel-dot--done' : '')}`}
                        onClick={() => {
                          if (step === 1) { setCurrentStep(1); return }
                          if (step === 2 && !canUseStep2) {
                            setGlobalMsg({ text: 'Primero completa el Paso 1 — Importar contactos.', type: 'err' })
                            return
                          }
                          if (step === 3 && !canUseStep3) {
                            setGlobalMsg({ text: !canUseStep2 ? 'Primero completa el Paso 1.' : 'Completa asunto y mensaje en el Paso 2.', type: 'err' })
                            return
                          }
                          setCurrentStep(step)
                        }}
                        aria-label={`Paso ${step}`}
                        aria-current={currentStep === step ? 'step' : undefined}
                      >
                        {step === 1 && hasImportedExcel ? <i className="fas fa-check" /> : step === 2 && hasSubjectAndBody ? <i className="fas fa-check" /> : step === 3 && hasSentCampaign ? <i className="fas fa-check" /> : step}
                      </button>
                    ))}
                  </div>
                  <div className="wf-carousel-buttons">
                    <button
                      type="button"
                      className="btn btn-secondary wf-carousel-prev"
                      onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                      disabled={currentStep === 1}
                    >
                      <i className="fas fa-arrow-left" /> Anterior
                    </button>
                    <button
                      type="button"
                      className="btn wf-carousel-next"
                      onClick={() => {
                        if (currentStep === 1 && !canUseStep2) return
                        if (currentStep === 2 && !canUseStep3) return
                        setCurrentStep((s) => Math.min(3, s + 1))
                      }}
                      disabled={
                        (currentStep === 1 && !canUseStep2) ||
                        (currentStep === 2 && !canUseStep3) ||
                        currentStep === 3
                      }
                    >
                      Siguiente <i className="fas fa-arrow-right" />
                    </button>
                  </div>
                </nav>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
