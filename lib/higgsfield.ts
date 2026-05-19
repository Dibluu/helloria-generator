import { getSendCountry, getReceiveCountry, SEASON } from './corridors'

const API_BASE = process.env.HIGGSFIELD_API_BASE ?? 'https://api.higgsfield.ai'
const API_KEY = process.env.HIGGSFIELD_API_KEY ?? ''

const SEASON_CLOTHING = {
  spring: 'light spring jacket, no hat',
  summer: 'light shirt or t-shirt, casual summer clothes',
  autumn: 'medium jacket, possibly a light scarf',
  winter: 'heavy winter coat, beanie hat, scarf',
}

export function buildPrompt(sendCode: string, receiveCode: string): string {
  const send = getSendCountry(sendCode)
  const receive = getReceiveCountry(receiveCode)
  if (!send || !receive) throw new Error('Unknown corridor')

  const clothing = SEASON_CLOTHING[SEASON]
  return (
    `Realistic portrait photo of a smiling middle-aged ${receive.appearance} man (45-55 years old), ` +
    `holding a smartphone and looking at it with joy, wearing ${clothing}, ` +
    `standing on a ${send.city}, blurred bokeh background, ` +
    `warm natural light, candid documentary style, photorealistic, ` +
    `professional advertising photography, centered portrait composition, no text, no logo`
  )
}

export async function submitJob(prompt: string): Promise<string> {
  const res = await fetch(`${API_BASE}/v1/generation/image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'marketing_studio_image',
      prompt,
      aspect_ratio: '1:1',
      count: 1,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Higgsfield API error ${res.status}: ${text}`)
  }

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
