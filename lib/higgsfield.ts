import type { Corridor } from './corridors'

const API_BASE = process.env.HIGGSFIELD_API_BASE ?? 'https://api.higgsfield.ai'
const API_KEY = process.env.HIGGSFIELD_API_KEY ?? ''

const SEASON_CLOTHING: Record<Corridor['season'], string> = {
  spring: 'light spring jacket, no hat',
  summer: 'light shirt or t-shirt, summer clothes',
  autumn: 'medium jacket, possibly a scarf',
  winter: 'heavy winter coat, beanie hat, scarf',
}

const ORIGIN_APPEARANCE: Record<string, string> = {
  MA: 'North African Moroccan',
  TN: 'North African Tunisian',
  AF: 'Afghan Central Asian',
  TR: 'Turkish Middle Eastern',
  CD: 'Central African Congolese',
  PH: 'Filipino Southeast Asian',
  PK: 'Pakistani South Asian',
  GN: 'West African Guinean',
}

const SEND_CITY: Record<string, string> = {
  BE: 'Brussels city center, Belgian architecture, tram visible',
  NL: 'Amsterdam city center, Dutch canal street, bicycles',
  FR: 'Paris street, French Haussmann architecture, boulangerie',
  CH: 'Zurich city center, Swiss street',
  ES: 'Madrid or Barcelona city street, Spanish architecture',
}

export function buildPrompt(corridor: Corridor): string {
  const appearance = ORIGIN_APPEARANCE[corridor.receive] ?? 'Middle Eastern'
  const city = SEND_CITY[corridor.send] ?? 'European city street'
  const clothing = SEASON_CLOTHING[corridor.season]

  return (
    `Realistic portrait photo of a smiling middle-aged ${appearance} man (45-55 years old), ` +
    `holding a smartphone and looking at it with joy, wearing ${clothing}, ` +
    `standing on a ${city}, blurred bokeh background, ` +
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
  // Response: { results: [{ id: "...", status: "pending", ... }] }
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
    const imageUrl = gen?.results?.rawUrl ?? gen?.imageUrl
    return { status: 'completed', imageUrl }
  }

  return { status: gen?.status ?? 'pending' }
}
