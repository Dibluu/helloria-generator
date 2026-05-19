'use client'

import { useState, useEffect } from 'react'
import {
  SEND_COUNTRIES,
  RECEIVE_COUNTRIES,
  LOCALE_LABELS,
  ALL_LOCALES,
  type Locale,
} from '@/lib/corridors'

type Step = 'idle' | 'generating' | 'compositing' | 'done' | 'error'

export default function Home() {
  const [send, setSend] = useState(SEND_COUNTRIES[0].code)
  const [receive, setReceive] = useState(RECEIVE_COUNTRIES[0].code)
  const [locale, setLocale] = useState<Locale>('fr')
  const [step, setStep] = useState<Step>('idle')
  const [overlayUrl, setOverlayUrl] = useState('')
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)


  useEffect(() => {
    if (step !== 'generating' && step !== 'compositing') return
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [step])

  async function generate() {
    setStep('generating')
    setElapsed(0)
    setError('')
    setOverlayUrl('')

    try {
      const startRes = await fetch('/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ send, receive }),
      })
      const { jobId, error: startErr } = await startRes.json()
      if (startErr) throw new Error(startErr)

      let imageUrl = ''
      while (!imageUrl) {
        await new Promise(r => setTimeout(r, 3000))
        const s = await fetch(`/api/status?jobId=${jobId}`).then(r => r.json())
        if (s.error) throw new Error(s.error)
        if (s.status === 'completed') imageUrl = s.imageUrl
        if (s.status === 'failed') throw new Error('Generation failed')
      }

      setStep('compositing')
      const country = RECEIVE_COUNTRIES.find(c => c.code === receive)!.name
      const url = `/api/overlay?portrait=${encodeURIComponent(imageUrl)}&country=${encodeURIComponent(country)}&locale=${locale}`
      setOverlayUrl(url)
      setStep('done')
    } catch (err: any) {
      setError(err.message)
      setStep('error')
    }
  }

  const busy = step === 'generating' || step === 'compositing'
  const receiveCountry = RECEIVE_COUNTRIES.find(c => c.code === receive)

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white font-sans">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-10 bg-[#0A0A0F]/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-black text-base tracking-tight">HELLORIA</span>
          </div>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <span className="text-white/40 text-sm">Creative Generator</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8">

        {/* ── Left panel ── */}
        <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-5">

          <div className="mb-2">
            <h1 className="text-xl font-black tracking-tight mb-1">Generate a creative</h1>
            <p className="text-white/40 text-sm leading-relaxed">
              Select a corridor and language — we'll generate the portrait and overlay automatically.
            </p>
          </div>

          {/* Sending country */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-white/35">Sending country</label>
            <div className="relative">
              <select
                value={send}
                onChange={e => setSend(e.target.value)}
                className="w-full appearance-none bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/60 focus:bg-white/8 transition cursor-pointer"
              >
                {SEND_COUNTRIES.map(c => (
                  <option key={c.code} value={c.code} className="bg-gray-900">{c.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Receiving country */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-white/35">Destination country</label>
            <div className="relative">
              <select
                value={receive}
                onChange={e => setReceive(e.target.value)}
                className="w-full appearance-none bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/60 focus:bg-white/8 transition cursor-pointer"
              >
                {RECEIVE_COUNTRIES.map(c => (
                  <option key={c.code} value={c.code} className="bg-gray-900">{c.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Corridor badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/8 border border-orange-500/15">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span className="text-orange-400 text-xs font-bold">
              {SEND_COUNTRIES.find(c => c.code === send)?.name} → {receiveCountry?.name}
            </span>
          </div>

          {/* Language */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-white/35">Language</label>
            <div className="relative">
              <select
                value={locale}
                onChange={e => setLocale(e.target.value as Locale)}
                className="w-full appearance-none bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/60 focus:bg-white/8 transition cursor-pointer"
              >
                {ALL_LOCALES.map(l => (
                  <option key={l} value={l} className="bg-gray-900">{LOCALE_LABELS[l]}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={busy}
            className={`
              relative w-full py-4 rounded-2xl text-sm font-black tracking-wide transition-all duration-200 overflow-hidden
              ${busy
                ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                : 'text-white shadow-xl shadow-orange-500/20 hover:shadow-orange-500/35 hover:scale-[1.02] active:scale-[0.99]'
              }
            `}
            style={busy ? {} : {
              background: 'linear-gradient(135deg, #F26A1F 0%, #E8521A 50%, #D04010 100%)',
            }}
          >
            {!busy && (
              <span className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
            )}
            <span className="relative flex items-center justify-center gap-2">
              {busy ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {step === 'compositing' ? 'Adding text…' : `Generating portrait… ${elapsed}s`}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Generate
                </>
              )}
            </span>
          </button>

          {busy && (
            <p className="text-[11px] text-white/25 text-center -mt-2">AI portrait generation takes ~20 seconds</p>
          )}

          {step === 'error' && (
            <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-xs leading-relaxed">
              <span className="font-bold">Error: </span>{error}
            </div>
          )}
        </aside>

        {/* ── Right panel — Preview ── */}
        <section className="flex-1 flex flex-col items-center gap-5">
          <div className="w-full max-w-lg">
            {step === 'done' && overlayUrl ? (
              <>
                {/* Image */}
                <div className="rounded-2xl overflow-hidden ring-1 ring-white/8 shadow-2xl shadow-black/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={overlayUrl} alt="Generated creative" className="w-full h-auto block" />
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-4">
                  <a
                    href={overlayUrl}
                    download={`helloria-${send}-${receive}-${locale}.png`}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-900 font-black text-sm py-3.5 rounded-xl hover:bg-orange-50 transition shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download
                  </a>
                  <button
                    onClick={generate}
                    className="px-5 py-3.5 rounded-xl bg-white/5 border border-white/8 text-sm font-bold text-white/60 hover:text-white hover:border-white/20 transition"
                  >
                    Regenerate
                  </button>
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="aspect-square rounded-2xl border border-dashed border-white/8 bg-white/[0.02] flex flex-col items-center justify-center gap-4 text-white/20">
                {busy ? (
                  <>
                    {/* Animated placeholder */}
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-full border-2 border-orange-500/20 animate-ping" />
                      <div className="absolute inset-2 rounded-full border-2 border-orange-500/40 border-t-orange-500 animate-spin" />
                      <div className="absolute inset-5 rounded-full bg-orange-500/20" />
                    </div>
                    <div className="text-center">
                      <p className="text-white/50 text-sm font-semibold">
                        {step === 'compositing' ? 'Adding text overlay…' : 'Generating AI portrait…'}
                      </p>
                      <p className="text-white/20 text-xs mt-1">{elapsed}s elapsed</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-white/3 flex items-center justify-center">
                      <svg className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M4.5 20.25h15a.75.75 0 00.75-.75V6a.75.75 0 00-.75-.75h-15a.75.75 0 00-.75.75v13.5c0 .414.336.75.75.75z" />
                      </svg>
                    </div>
                    <p className="text-sm">Your creative will appear here</p>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
