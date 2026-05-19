import { NextResponse } from 'next/server'
import { getCorridor } from '@/lib/corridors'
import { buildPrompt, submitJob } from '@/lib/higgsfield'

export async function POST(request: Request) {
  try {
    const { send, receive } = await request.json()

    const corridor = getCorridor(send, receive)
    if (!corridor) {
      return NextResponse.json({ error: 'Corridor introuvable' }, { status: 400 })
    }

    const prompt = buildPrompt(corridor)
    const jobId = await submitJob(prompt)

    return NextResponse.json({ jobId })
  } catch (err: any) {
    console.error('[start]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
