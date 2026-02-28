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
