import { NextResponse } from 'next/server'
import { buildPrompt, submitJob } from '@/lib/higgsfield'

export async function POST(request: Request) {
  try {
    const { send, receive } = await request.json()
    const prompt = buildPrompt(send, receive)
    const jobId = await submitJob(prompt)
    return NextResponse.json({ jobId })
  } catch (err: any) {
    console.error('[start]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
