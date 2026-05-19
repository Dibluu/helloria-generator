import { getSendCountry, getReceiveCountry, SEASON } from './corridors'
import type { VariantConfig } from './variants'

const API_BASE = process.env.HIGGSFIELD_API_BASE ?? 'https://api.higgsfield.ai'
const API_KEY  = process.env.HIGGSFIELD_API_KEY  ?? ''

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

  const clothing = SEASON_CLOTHING[SEASON]
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
  const res = await fetch(`${API_BASE}/v1/generation/image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'marketing_studio_image', prompt, aspect_ratio: '1:1', count: 1 }),
  })
  if (!res.ok) throw new Error(`Higgsfield API error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const jobId = data?.results?.[0]?.id ?? data?.id
  if (!jobId) throw new Error('No job ID in Higgsfield response')
  return jobId
}

export async function getJobStatus(jobId: string): Promise<{ status: string; imageUrl?: string }> {
  const res = await fetch(`${API_BASE}/v1/jobs/${jobId}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  })
  if (!res.ok) throw new Error(`Higgsfield status error ${res.status}`)
  const data = await res.json()
  const gen = data?.generation ?? data
  if (gen?.status === 'completed') {
    return { status: 'completed', imageUrl: gen?.results?.rawUrl ?? gen?.imageUrl }
  }
  return { status: gen?.status ?? 'pending' }
}
