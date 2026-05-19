import { ImageResponse } from 'next/og'
import { getCopy } from '@/lib/copy'
import type { Locale } from '@/lib/corridors'
import { readFileSync } from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const portraitUrl = searchParams.get('portrait') ?? ''
  const country = searchParams.get('country') ?? ''
  const locale = (searchParams.get('locale') ?? 'fr') as Locale

  const copy = getCopy(locale, country)

  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NunitoSans-Black.ttf')
  const fontData = readFileSync(fontPath)

  return new ImageResponse(
    (
      <div
        style={{
          width: 1024,
          height: 1024,
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        {/* Portrait background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={portraitUrl}
          width={1024}
          height={1024}
          style={{ position: 'absolute', top: 0, left: 0, objectFit: 'cover' }}
          alt=""
        />

        {/* Dark arc — ellipse positioned so only bottom half is visible */}
        <div
          style={{
            position: 'absolute',
            top: '-22%',
            left: '-15%',
            width: '130%',
            height: '55%',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.15)',
          }}
        />

        {/* Text block */}
        <div
          style={{
            position: 'absolute',
            top: 44,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {/* Headline */}
          <div style={{ display: 'flex', fontSize: 65, fontFamily: 'NunitoSans', fontWeight: 900, lineHeight: 1 }}>
            <span style={{ color: 'white' }}>{copy.prefix}</span>
            <span style={{ color: '#F26A1F' }}>{country}</span>
            {copy.suffix && <span style={{ color: 'white' }}>{copy.suffix}</span>}
          </div>

          {/* Subheadline */}
          <div
            style={{
              color: 'white',
              fontSize: 32,
              fontFamily: 'NunitoSans',
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {copy.subheadline}
          </div>
        </div>
      </div>
    ),
    {
      width: 1024,
      height: 1024,
      fonts: [{ name: 'NunitoSans', data: fontData, weight: 900, style: 'normal' }],
    }
  )
}
