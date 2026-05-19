'use client'

import { useState } from 'react'
import {
  SEND_COUNTRIES, RECEIVE_COUNTRIES, LOCALE_LABELS, ALL_LOCALES, type Locale,
} from '@/lib/corridors'
import { AXE1_PROFILE, AXE2_EMOTION, AXE3_ENV, AXE5_FRAMING, ALL_AXES } from '@/lib/variants'

type Step = 'idle' | 'generating' | 'compositing' | 'done' | 'error'

interface Result {
  badge: string
  label: string
  imageUrl: string
  overlayUrl: string
}

export default function Home() {
  const [send,        setSend]        = useState(SEND_COUNTRIES[0].code)
  const [receive,     setReceive]     = useState(RECEIVE_COUNTRIES[0].code)
  const [locale,      setLocale]      = useState<Locale>('fr')
  const [profileId,   setProfileId]   = useState(AXE1_PROFILE.options[0].id)
  const [emotionId,   setEmotionId]   = useState(AXE2_EMOTION.options[0].id)
  const [environmentId, setEnvId]     = useState(AXE3_ENV.options[0].id)
  const [framingId,   setFramingId]   = useState(AXE5_FRAMING.options[0].id)
  const [step,        setStep]        = useState<Step>('idle')
  const [results,     setResults]     = useState<Result[]>([])
  const [error,       setError]       = useState('')
  const [elapsed,     setElapsed]     = useState(0)
  const [progress,    setProgress]    = useState(0) // 0-4 completed

  const busy = step === 'generating' || step === 'compositing'

  async function generate() {
    setStep('generating')
    setElapsed(0)
    setProgress(0)
    setError('')
    setResults([])

    const timer = setInterval(() => setElapsed(e => e + 1), 1000)

    try {
      const startRes = await fetch('/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ send, receive, profileId, emotionId, environmentId, framingId }),
      })
      const { jobIds, labels, badges, error: startErr } = await startRes.json()
      if (startErr) throw new Error(startErr)

      // Poll all 4 jobs until all complete
      const imageUrls: (string | null)[] = Array(4).fill(null)
      let done = 0

      while (done < 4) {
        await new Promise(r => setTimeout(r, 3000))
        const pending = jobIds.filter((_: string, i: number) => imageUrls[i] === null)
        const res = await fetch(`/api/status?jobIds=${pending.join(',')}`).then(r => r.json())
        if (res.error) throw new Error(res.error)

        let p = 0
        for (const job of res.jobs) {
          const idx = jobIds.indexOf(pending[res.jobs.indexOf(job)])
          if (job.status === 'completed' && job.imageUrl) {
            imageUrls[idx] = job.imageUrl
            p++
          }
          if (job.status === 'failed') throw new Error(`Variant ${idx + 1} failed`)
        }
        done = imageUrls.filter(Boolean).length
        setProgress(done)
      }

      // Build overlay URLs
      setStep('compositing')
      const country = RECEIVE_COUNTRIES.find(c => c.code === receive)!.name
      const built: Result[] = (imageUrls as string[]).map((imageUrl, i) => ({
        badge: badges[i],
        label: labels[i],
        imageUrl,
        overlayUrl: `/api/overlay?portrait=${encodeURIComponent(imageUrl)}&country=${encodeURIComponent(country)}&locale=${locale}`,
      }))
      setResults(built)
      setStep('done')
    } catch (err: any) {
      setError(err.message)
      setStep('error')
    } finally {
      clearInterval(timer)
    }
  }

  const receiveCountry = RECEIVE_COUNTRIES.find(c => c.code === receive)

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white">

      {/* Header */}
      <header className="border-b border-white/5 sticky top-0 z-10 bg-[#0A0A0F]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-3">
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

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">

        {/* ── Left panel ── */}
        <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-5">

          <div>
            <h1 className="text-xl font-black tracking-tight mb-1">Generate 4 variants</h1>
            <p className="text-white/40 text-sm leading-relaxed">
              Set your corridor, language and creative axes — we'll generate 4 A/B-ready variants simultaneously.
            </p>
          </div>

          {/* Sending country */}
          <SelectField label="Sending country" value={send} onChange={setSend}>
            {SEND_COUNTRIES.map(c => <option key={c.code} value={c.code} className="bg-gray-900">{c.name}</option>)}
          </SelectField>

          {/* Destination country */}
          <SelectField label="Destination country" value={receive} onChange={setReceive}>
            {RECEIVE_COUNTRIES.map(c => <option key={c.code} value={c.code} className="bg-gray-900">{c.name}</option>)}
          </SelectField>

          {/* Corridor badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/8 border border-orange-500/15">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span className="text-orange-400 text-xs font-bold">
              {SEND_COUNTRIES.find(c => c.code === send)?.name} → {receiveCountry?.name}
            </span>
          </div>

          {/* Language */}
          <SelectField label="Language" value={locale} onChange={v => setLocale(v as Locale)}>
            {ALL_LOCALES.map(l => <option key={l} value={l} className="bg-gray-900">{LOCALE_LABELS[l]}</option>)}
          </SelectField>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/6" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">Creative axes</span>
            <div className="h-px flex-1 bg-white/6" />
          </div>

          {/* Axe 1 — Profile */}
          <SelectField label="Axe 1 — Profile (V1 base)" value={profileId} onChange={setProfileId} accent>
            {AXE1_PROFILE.options.map(o => <option key={o.id} value={o.id} className="bg-gray-900">{o.label}</option>)}
          </SelectField>

          {/* Axe 2 — Emotion */}
          <SelectField label="Axe 2 — Emotion (V1 base)" value={emotionId} onChange={setEmotionId} accent>
            {AXE2_EMOTION.options.map(o => <option key={o.id} value={o.id} className="bg-gray-900">{o.label}</option>)}
          </SelectField>

          {/* Axe 3 — Environment */}
          <SelectField label="Axe 3 — Environment (V1 base)" value={environmentId} onChange={setEnvId} accent>
            {AXE3_ENV.options.map(o => <option key={o.id} value={o.id} className="bg-gray-900">{o.label}</option>)}
          </SelectField>

          {/* Axe 5 — Framing */}
          <SelectField label="Axe 5 — Framing (all variants)" value={framingId} onChange={setFramingId} accent>
            {AXE5_FRAMING.options.map(o => <option key={o.id} value={o.id} className="bg-gray-900">{o.label}</option>)}
          </SelectField>

          {/* Variant preview */}
          <div className="rounded-xl bg-white/3 border border-white/6 p-3 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">What will be generated</p>
            {[
              { badge: 'V1', desc: 'Control — all selected values' },
              { badge: 'V2', desc: `Profile → ${AXE1_PROFILE.options[(AXE1_PROFILE.options.findIndex(o => o.id === profileId) + 1) % 4].label}` },
              { badge: 'V3', desc: `Emotion → ${AXE2_EMOTION.options[(AXE2_EMOTION.options.findIndex(o => o.id === emotionId) + 1) % 4].label}` },
              { badge: 'V4', desc: `Environment → ${AXE3_ENV.options[(AXE3_ENV.options.findIndex(o => o.id === environmentId) + 1) % 4].label}` },
            ].map(({ badge, desc }) => (
              <div key={badge} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-orange-500/15 text-orange-400 text-[10px] font-black flex items-center justify-center shrink-0">{badge}</span>
                <span className="text-white/40 text-xs">{desc}</span>
              </div>
            ))}
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={busy}
            className={`relative w-full py-4 rounded-2xl text-sm font-black tracking-wide transition-all duration-200 overflow-hidden
              ${busy ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                     : 'text-white shadow-xl shadow-orange-500/20 hover:shadow-orange-500/35 hover:scale-[1.02] active:scale-[0.99]'}`}
            style={busy ? {} : { background: 'linear-gradient(135deg, #F26A1F 0%, #E8521A 50%, #D04010 100%)' }}
          >
            {!busy && <span className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />}
            <span className="relative flex items-center justify-center gap-2">
              {busy ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {step === 'compositing' ? 'Adding text…'
                    : `Generating… ${progress}/4 ready — ${elapsed}s`}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Generate 4 Variants
                </>
              )}
            </span>
          </button>

          {busy && <p className="text-[11px] text-white/25 text-center -mt-2">4 parallel AI generations — ~20–30 seconds</p>}
          {step === 'error' && (
            <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-xs">
              <span className="font-bold">Error: </span>{error}
            </div>
          )}
        </aside>

        {/* ── Right panel — 2×2 grid ── */}
        <section className="flex-1">
          {step === 'done' && results.length ? (
            <div className="grid grid-cols-2 gap-4">
              {results.map((r, i) => (
                <div key={i} className="flex flex-col gap-2">
                  {/* Label */}
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-black flex items-center justify-center shrink-0">{r.badge}</span>
                    <span className="text-white/50 text-xs font-medium truncate">{r.label}</span>
                  </div>
                  {/* Image */}
                  <div className="rounded-xl overflow-hidden ring-1 ring-white/8 shadow-xl shadow-black/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.overlayUrl} alt={r.label} className="w-full h-auto block" />
                  </div>
                  {/* Download */}
                  <a
                    href={r.overlayUrl}
                    download={`helloria-${send}-${receive}-${locale}-${r.badge}.png`}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/8 text-xs font-bold text-white/50 hover:text-white hover:border-white/20 hover:bg-white/8 transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download {r.badge}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            /* Empty / loading state */
            <div className="grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                      busy && progress > i ? 'bg-orange-500/30 text-orange-300' :
                      busy ? 'bg-white/5 text-white/20' : 'bg-white/5 text-white/20'
                    }`}>V{i + 1}</span>
                    <span className="text-white/20 text-xs">
                      {busy && progress > i ? 'Ready' : busy ? 'Generating…' : ''}
                    </span>
                  </div>
                  <div className={`aspect-square rounded-xl border border-dashed flex items-center justify-center transition-all ${
                    busy && progress > i ? 'border-orange-500/30 bg-orange-500/5' :
                    busy ? 'border-white/8 bg-white/[0.02]' : 'border-white/6 bg-white/[0.01]'
                  }`}>
                    {busy ? (
                      progress > i
                        ? <svg className="w-8 h-8 text-orange-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        : <div className="w-6 h-6 border-2 border-white/10 border-t-orange-500/50 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-8 h-8 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M4.5 20.25h15a.75.75 0 00.75-.75V6a.75.75 0 00-.75-.75h-15a.75.75 0 00-.75.75v13.5c0 .414.336.75.75.75z" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

// ── Reusable select component ──
function SelectField({
  label, value, onChange, children, accent = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
  accent?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-[11px] font-bold uppercase tracking-widest ${accent ? 'text-orange-400/60' : 'text-white/35'}`}>{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`w-full appearance-none bg-white/5 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition cursor-pointer
            ${accent ? 'border-orange-500/20 focus:border-orange-500/50' : 'border-white/8 focus:border-orange-500/60 focus:bg-white/8'}`}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </div>
  )
}
