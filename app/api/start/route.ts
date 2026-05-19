import { NextResponse } from 'next/server'
import { buildPrompt, submitJob } from '@/lib/higgsfield'
import { buildVariants } from '@/lib/variants'
import { AXE1_PROFILE, AXE2_EMOTION, AXE3_ENV, AXE5_FRAMING } from '@/lib/variants'

export async function POST(request: Request) {
  try {
    const { send, receive, profileId, emotionId, environmentId, framingId } = await request.json()

    const profile     = AXE1_PROFILE.options.find(o => o.id === profileId)     ?? AXE1_PROFILE.options[0]
    const emotion     = AXE2_EMOTION.options.find(o => o.id === emotionId)     ?? AXE2_EMOTION.options[0]
    const environment = AXE3_ENV.options.find(o => o.id === environmentId)     ?? AXE3_ENV.options[0]
    const framing     = AXE5_FRAMING.options.find(o => o.id === framingId)     ?? AXE5_FRAMING.options[0]

    const variants = buildVariants(profile, emotion, environment, framing)

    // Submit all 4 jobs in parallel
    const jobIds = await Promise.all(
      variants.map(v => submitJob(buildPrompt(send, receive, v)))
    )

    return NextResponse.json({
      jobIds,
      labels: variants.map(v => v.label),
      badges: variants.map(v => v.badge),
    })
  } catch (err: any) {
    console.error('[start]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
