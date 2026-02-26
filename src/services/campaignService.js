import { apiEmail } from './api'

export async function createCampaign({ name, subject, body }) {
  return apiEmail('/api/v1/excel/campaigns', {
    method: 'POST',
    body: { name: name || subject, subject, body },
  })
}

export async function sendCampaign(campaignId) {
  return apiEmail('/api/v1/campaigns/send', {
    method: 'POST',
    body: { campaign_id: parseInt(campaignId, 10) },
  })
}
