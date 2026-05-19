import sharp from 'sharp'
import { readFileSync } from 'fs'
import path from 'path'
import { getCopy } from '@/lib/copy'
import type { Locale } from '@/lib/corridors'

export const runtime = 'nodejs'
export const maxDuration = 30

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildSVG(
  w: number, h: number,
  prefix: string, country: string, suffix: string | undefined,
  sub: string,
  fontBase64: string,
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <style>
      @font-face {
        font-family: 'Nunito';
        src: url('data:font/truetype;base64,${fontBase64}');
        font-weight: 900;
      }
      .h { font-family: 'Nunito', Arial, sans-serif; font-weight: 900; font-size: 65px; }
      .s { font-family: 'Nunito', Arial, sans-serif; font-weight: 900; font-size: 32px; }
    </style>
  </defs>

  <!-- Dark arc -->
  <ellipse
    cx="${w / 2}" cy="${-h * 0.1125}"
    rx="${w * 0.67}" ry="${h * 0.235}"
    fill="rgba(0,0,0,0.15)"
  />

  <!-- Headline -->
  <text x="${w / 2}" y="${h * 0.1}" text-anchor="middle" class="h">
    <tspan fill="white">${esc(prefix)}</tspan><tspan fill="#F26A1F">${esc(country)}</tspan>${suffix ? `<tspan fill="white">${esc(suffix)}</tspan>` : ''}
  </text>

  <!-- Subheadline -->
  <text x="${w / 2}" y="${h * 0.173}" text-anchor="middle" class="s" fill="white">${esc(sub)}</text>
</svg>`
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const portraitUrl = searchParams.get('portrait') ?? ''
  const country     = searchParams.get('country')  ?? ''
  const locale      = (searchParams.get('locale')  ?? 'fr') as Locale

  if (!portraitUrl) {
    return new Response('Missing portrait URL', { status: 400 })
  }

  const copy = getCopy(locale, country)

  try {
    // Load font as base64
    const fontPath   = path.join(process.cwd(), 'public', 'fonts', 'NunitoSans-Black.ttf')
    const fontBase64 = readFileSync(fontPath).toString('base64')

    // Fetch portrait
    const portraitRes = await fetch(portraitUrl, { signal: AbortSignal.timeout(15000) })
    if (!portraitRes.ok) throw new Error(`Portrait fetch failed: ${portraitRes.status}`)
    const portraitBuf = Buffer.from(await portraitRes.arrayBuffer())

    // Resize to 1024×1024
    const base = await sharp(portraitBuf)
      .resize(1024, 1024, { fit: 'cover', position: 'centre' })
      .png()
      .toBuffer()

    // Build SVG overlay
    const svg = buildSVG(1024, 1024, copy.prefix, country, copy.suffix, copy.subheadline, fontBase64)

    // Composite SVG on top of portrait
    const output = await sharp(base)
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer()

    return new Response(output as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (err: any) {
    console.error('[overlay]', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
