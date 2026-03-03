import { useState, useCallback, useEffect } from 'react'
import { HeaderBar } from '../components/HeaderBar'
import { ExcelImport } from '../components/ExcelImport'
import { CampaignForm } from '../components/CampaignForm'
import { AIAssistant } from '../components/AIAssistant'
import { SendCampaign } from '../components/SendCampaign'
import { Message } from '../components/Message'
import { listCampaigns } from '../services/excelService'

export function PanelPage() {
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaignId, setSelectedCampaignId] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [globalMsg, setGlobalMsg] = useState({ text: '', type: 'info' })

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
        const cid = c.id ?? c.campaign_id
        return cid === id ? { ...c, name: name ?? c.name, subject: subject ?? c.subject, body: body ?? c.body } : c
      })
    )
  }, [])

  const removeCampaign = useCallback((id) => {
    setCampaigns((prev) => prev.filter((c) => (c.id ?? c.campaign_id) !== id))
  }, [])

  const handleBodyAppend = useCallback((newBody) => {
    setBody(newBody)
  }, [])

  // Cuando el usuario selecciona una campaña de la lista, rellenar asunto y mensaje
  useEffect(() => {
    if (!selectedCampaignId) {
      // Si elige "Crear nueva campaña", se limpian los campos en CampaignForm
      return
    }
    const cid = String(selectedCampaignId)
    const found = campaigns.find((c) => String(c.id ?? c.campaign_id ?? c.id_campaign ?? '') === cid)
    if (!found) return
    const s = found.subject ?? found.name ?? found.nombre ?? ''
    const b = found.body ?? found.message ?? ''
    if (typeof s === 'string') setSubject(s)
    if (typeof b === 'string') setBody(b)
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
            <small>Deja que la IA te proponga mejoras</small>
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
            <small>Confirma el envío a tu base de contactos</small>
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
