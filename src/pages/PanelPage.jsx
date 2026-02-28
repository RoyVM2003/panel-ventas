import { useState, useCallback, useEffect } from 'react'
import { HeaderBar } from '../components/HeaderBar'
import { ExcelImport } from '../components/ExcelImport'
import { CampaignForm } from '../components/CampaignForm'
import { AIAssistant } from '../components/AIAssistant'
import { SendCampaign } from '../components/SendCampaign'
import { Message } from '../components/Message'
import { listCampaigns } from '../services/excelService'
import { getCampaign } from '../services/campaignService'

export function PanelPage() {
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaignId, setSelectedCampaignId] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [globalMsg, setGlobalMsg] = useState({ text: '', type: 'info' })

  const loadCampaigns = useCallback(async () => {
    try {
      const list = await listCampaigns()
      setCampaigns(list)
    } catch (_) {
      setCampaigns([])
    }
  }, [])

  useEffect(() => {
    loadCampaigns()
  }, [loadCampaigns])

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
      <Message text={globalMsg.text} type={globalMsg.type} />
      <ExcelImport onImportSuccess={loadCampaigns} />
      <CampaignForm
        campaigns={campaigns}
        selectedCampaignId={selectedCampaignId}
        onSelectedCampaignIdChange={setSelectedCampaignId}
        onCampaignsChange={loadCampaigns}
        subject={subject}
        body={body}
        onSubjectChange={setSubject}
        onBodyChange={setBody}
      />
      <AIAssistant body={body} onBodyAppend={handleBodyAppend} onSubjectChange={setSubject} />
      <SendCampaign subject={subject} message={body} />
    </div>
  )
}
