import { NextResponse } from 'next/server'
import { getJobStatus } from '@/lib/higgsfield'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const raw = searchParams.get('jobIds') ?? ''
  const jobIds = raw.split(',').filter(Boolean)

  if (!jobIds.length) {
    return NextResponse.json({ error: 'jobIds missing' }, { status: 400 })
  }

  try {
    const results = await Promise.all(jobIds.map(id => getJobStatus(id)))
    return NextResponse.json({ jobs: results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
