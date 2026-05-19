import { getSendCountry, getReceiveCountry, SEASON } from './corridors'
import type { VariantConfig } from './variants'

const API_BASE  = process.env.HIGGSFIELD_API_BASE  ?? 'https://platform.higgsfield.ai'
const API_KEY   = process.env.HIGGSFIELD_API_KEY   ?? ''
const API_KEY_ID = process.env.HIGGSFIELD_API_KEY_ID ?? ''

// Authorization: Key {key_id}:{key_secret}
function authHeader() {
  return `Key ${API_KEY_ID}:${API_KEY}`
}

const SEASON_CLOTHING = {
  spring: 'light spring jacket, no hat',
  summer: 'light shirt or t-shirt, casual summer clothes',
  autumn: 'medium jacket, possibly a light scarf',
  winter: 'heavy winter coat, beanie hat, scarf',
}

export function buildPrompt(sendCode: string, receiveCode: string, variant: VariantConfig): string {
  const send    = getSendCountry(sendCode)
  const receive = getReceiveCountry(receiveCode)
  if (!send || !receive) throw new Error('Unknown corridor')

  const clothing  = SEASON_CLOTHING[SEASON]
  const envPrompt = variant.environment.prompt.replace('{city}', send.city)

  return (
    `Realistic portrait photo of a ${receive.appearance} ${variant.profile.prompt}, ` +
    `${variant.emotion.prompt}, wearing ${clothing}, ` +
    `${envPrompt}, ` +
    `${variant.framing.prompt}, ` +
    `warm natural light, candid documentary style, photorealistic, ` +
    `professional advertising photography, no text, no logo`
  )
}

export async function submitJob(prompt: string): Promise<string> {
  const res = await fetch(`${API_BASE}/higgsfield-ai/marketing_studio_image/standard`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, aspect_ratio: '1:1', resolution: '1k' }),
  })

  if (!res.ok) throw new Error(`Higgsfield error ${res.status}: ${await res.text()}`)

  const data = await res.json()
  const jobId = data?.request_id
  if (!jobId) throw new Error('No request_id in Higgsfield response')
  return jobId
}

export async function getJobStatus(jobId: string): Promise<{ status: string; imageUrl?: string }> {
  const res = await fetch(`${API_BASE}/requests/${jobId}/status`, {
    headers: { Authorization: authHeader() },
  })

  if (!res.ok) throw new Error(`Higgsfield status error ${res.status}`)

  const data = await res.json()

  if (data.status === 'completed') {
    const imageUrl = data?.images?.[0]?.url
    return { status: 'completed', imageUrl }
  }

  if (data.status === 'failed' || data.status === 'nsfw') {
    return { status: 'failed' }
  }

  return { status: data.status ?? 'queued' }
}
