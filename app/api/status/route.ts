import { NextResponse } from 'next/server'
import { getJobStatus } from '@/lib/higgsfield'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')

  if (!jobId) {
    return NextResponse.json({ error: 'jobId manquant' }, { status: 400 })
  }

  try {
    const result = await getJobStatus(jobId)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[status]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
