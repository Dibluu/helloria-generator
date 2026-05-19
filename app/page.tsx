'use client'

import { useState, useEffect } from 'react'
import { CORRIDORS, LOCALE_LABELS, type Locale } from '@/lib/corridors'

type Step = 'idle' | 'generating' | 'compositing' | 'done' | 'error'

const SEND_COUNTRIES = [...new Set(CORRIDORS.map(c => c.send))]

export default function Home() {
  const [send, setSend] = useState(CORRIDORS[0].send)
  const [receive, setReceive] = useState(CORRIDORS[0].receive)
  const [locale, setLocale] = useState<Locale>(CORRIDORS[0].locales[0])
  const [step, setStep] = useState<Step>('idle')
  const [overlayUrl, setOverlayUrl] = useState('')
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)

  const availableReceive = CORRIDORS.filter(c => c.send === send)
  const currentCorridor = CORRIDORS.find(c => c.send === send && c.receive === receive)
  const availableLocales = currentCorridor?.locales ?? []

  useEffect(() => {
    const firstReceive = availableReceive[0]?.receive ?? ''
    setReceive(firstReceive)
  }, [send])

  useEffect(() => {
    const corridor = CORRIDORS.find(c => c.send === send && c.receive === receive)
    if (corridor && !corridor.locales.includes(locale)) {
      setLocale(corridor.locales[0])
    }
  }, [receive])

  useEffect(() => {
    if (step !== 'generating' && step !== 'compositing') return
    const timer = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(timer)
  }, [step])

  async function generate() {
    setStep('generating')
    setElapsed(0)
    setError('')
    setOverlayUrl('')

    try {
      // 1. Start Higgsfield job
      const startRes = await fetch('/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ send, receive }),
      })
      const { jobId, error: startErr } = await startRes.json()
      if (startErr) throw new Error(startErr)

      // 2. Poll until complete
      let imageUrl = ''
      while (!imageUrl) {
        await new Promise(r => setTimeout(r, 3000))
        const statusRes = await fetch(`/api/status?jobId=${jobId}`)
        const status = await statusRes.json()
        if (status.error) throw new Error(status.error)
        if (status.status === 'completed') imageUrl = status.imageUrl
        if (status.status === 'failed') throw new Error('La génération a échoué')
      }

      // 3. Build overlay URL
      setStep('compositing')
      const corridor = CORRIDORS.find(c => c.send === send && c.receive === receive)!
      const country = corridor.receiveName
      const url = `/api/overlay?portrait=${encodeURIComponent(imageUrl)}&country=${encodeURIComponent(country)}&locale=${locale}`
      setOverlayUrl(url)
      setStep('done')
    } catch (err: any) {
      setError(err.message)
      setStep('error')
    }
  }

  const corridorLabel = `${send} → ${receive}`

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-orange-500" />
        <span className="font-black text-lg tracking-tight">HELLORIA</span>
        <span className="text-gray-500 text-sm ml-2">Creative Generator</span>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        {/* Form */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <div>
            <h1 className="text-2xl font-black mb-1">Générer une creative</h1>
            <p className="text-gray-400 text-sm">Sélectionne le corridor et la langue, puis génère.</p>
          </div>

          {/* Pays d'envoi */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Pays d'envoi</label>
            <select
              value={send}
              onChange={e => setSend(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition"
            >
              {SEND_COUNTRIES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Pays de réception */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Pays de réception</label>
            <select
              value={receive}
              onChange={e => setReceive(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition"
            >
              {availableReceive.map(c => (
                <option key={c.receive} value={c.receive}>{c.receiveName} ({c.receive})</option>
              ))}
            </select>
          </div>

          {/* Langue */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Langue</label>
            <div className="flex gap-2 flex-wrap">
              {availableLocales.map(l => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition ${
                    locale === l
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-900 border border-gray-700 text-gray-300 hover:border-orange-500'
                  }`}
                >
                  {LOCALE_LABELS[l]}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={step === 'generating' || step === 'compositing'}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl transition text-base tracking-wide"
          >
            {step === 'generating' ? `Génération du portrait… ${elapsed}s` :
             step === 'compositing' ? 'Assemblage du texte…' :
             'Générer'}
          </button>

          {step === 'generating' && (
            <p className="text-xs text-gray-500 text-center">La génération IA prend environ 15-30 secondes.</p>
          )}

          {step === 'error' && (
            <div className="bg-red-950 border border-red-800 rounded-lg px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="flex-1 flex flex-col items-center gap-4">
          {step === 'done' && overlayUrl ? (
            <>
              <div className="rounded-2xl overflow-hidden shadow-2xl w-full max-w-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={overlayUrl} alt="Creative générée" className="w-full h-auto" />
              </div>
              <a
                href={overlayUrl}
                download={`helloria-${send}-${receive}-${locale}.png`}
                className="inline-flex items-center gap-2 bg-white text-gray-900 font-black px-6 py-3 rounded-xl hover:bg-orange-50 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Télécharger
              </a>
            </>
          ) : (
            <div className="w-full max-w-lg aspect-square rounded-2xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center gap-3 text-gray-600">
              {step === 'generating' || step === 'compositing' ? (
                <>
                  <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm">{step === 'compositing' ? 'Assemblage…' : 'Portrait en cours…'}</p>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">L'image apparaîtra ici</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
