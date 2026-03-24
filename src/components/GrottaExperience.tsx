'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AudioAnalyzer } from '@/lib/AudioAnalyzer'
import { BreathCycleDetector, summarizeBreaths } from '@/lib/breathAnalysis'
import { getBreathMessage, type BreathInsight } from '@/lib/breathPatterns'
import { BreathingSphere } from '@/components/BreathingSphere'
import { FallbackOrb } from '@/components/FallbackOrb'
import { WelcomeModal } from '@/components/WelcomeModal'
import { ProgressArc } from '@/components/ProgressArc'
import { BreathResult } from '@/components/BreathResult'

const MODAL_FADE_MS = 600
const SPHERE_DELAY_MS = 200
const SPHERE_IN_MS = 1200
const NOISE_PRE_MS = 2000
const SESSION_MS = 60_000
const NOISE_RMS_THRESHOLD = 0.11
const MIN_CYCLES = 5

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

type Phase =
  | 'welcome'
  | 'entering'
  | 'await_mic'
  | 'noise_calib'
  | 'noise_warn'
  | 'session'
  | 'result'
  | 'mic_denied'
  | 'breath_fail'
  | 'skipped'

export function GrottaExperience() {
  const [phase, setPhase] = useState<Phase>('welcome')
  const [modalOpen, setModalOpen] = useState(true)
  const [modalExiting, setModalExiting] = useState(false)
  const [entrance, setEntrance] = useState(0)
  const [sessionProgress, setSessionProgress] = useState(0)
  const [insight, setInsight] = useState<BreathInsight | null>(null)
  const [resultVisible, setResultVisible] = useState(false)
  const [webgl, setWebgl] = useState(true)
  const [icosaDetail, setIcosaDetail] = useState(4)
  const [bloom, setBloom] = useState(true)
  const [dissolveV, setDissolveV] = useState(0)
  const [bgMigrated, setBgMigrated] = useState(false)
  const [siteVisible, setSiteVisible] = useState(false)
  const [noiseCalibAvg, setNoiseCalibAvg] = useState<number | null>(null)

  const experienceT0 = useRef<number | null>(null)
  const analyzerRef = useRef<AudioAnalyzer | null>(null)
  const detectorRef = useRef(new BreathCycleDetector())
  const sessionT0 = useRef<number | null>(null)
  const noiseSamplesRef = useRef<number[]>([])
  const rmsRef = useRef(0)
  const sessionDoneRef = useRef(false)

  useEffect(() => {
    setWebgl(hasWebGL())
    if (typeof window !== 'undefined' && window.innerWidth < 520) {
      setIcosaDetail(3)
    }
  }, [])

  useEffect(() => {
    let id = 0
    const loop = () => {
      rmsRef.current = analyzerRef.current?.getSmoothedRMS() ?? 0
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (phase !== 'entering') return
    const t0 = experienceT0.current
    if (!t0) return
    let stop = false
    const tick = () => {
      if (stop) return
      const elapsed = performance.now() - t0
      let e = 0
      if (elapsed < SPHERE_DELAY_MS) e = 0
      else e = Math.min(1, (elapsed - SPHERE_DELAY_MS) / SPHERE_IN_MS)
      setEntrance(easeOutCubic(e))
      if (e < 1) requestAnimationFrame(tick)
      else setPhase('await_mic')
    }
    requestAnimationFrame(tick)
    return () => {
      stop = true
    }
  }, [phase])

  const finishSession = useCallback(() => {
    if (sessionDoneRef.current) return
    sessionDoneRef.current = true
    const proc = detectorRef.current.getProcessedCycles()
    if (proc.length < MIN_CYCLES) {
      setPhase('breath_fail')
      analyzerRef.current?.stop()
      return
    }
    const sum = summarizeBreaths(proc)
    if (!sum) {
      setPhase('breath_fail')
      analyzerRef.current?.stop()
      return
    }
    setInsight(getBreathMessage(sum.rr, sum.ieRatio))
    setPhase('result')
    window.setTimeout(() => setResultVisible(true), 450)
  }, [])

  useEffect(() => {
    if (phase !== 'session') {
      sessionDoneRef.current = false
      return
    }
    sessionT0.current = performance.now()
    let stop = false
    const tick = () => {
      if (stop || !sessionT0.current) return
      const elapsed = performance.now() - sessionT0.current
      const p = Math.min(1, elapsed / SESSION_MS)
      setSessionProgress(p)
      const tSec = elapsed / 1000
      detectorRef.current.processSample(rmsRef.current, tSec)
      if (elapsed >= SESSION_MS) {
        finishSession()
        return
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    return () => {
      stop = true
    }
  }, [phase, finishSession])

  const startSessionFromCalib = useCallback(() => {
    detectorRef.current.reset()
    sessionT0.current = performance.now()
    setSessionProgress(0)
    sessionDoneRef.current = false
    setPhase('session')
  }, [])

  useEffect(() => {
    if (phase !== 'noise_calib') return
    noiseSamplesRef.current = []
    const t0 = performance.now()
    let stop = false
    const tick = () => {
      if (stop) return
      noiseSamplesRef.current.push(rmsRef.current)
      if (performance.now() - t0 < NOISE_PRE_MS) requestAnimationFrame(tick)
      else {
        const arr = noiseSamplesRef.current
        const avg = arr.reduce((s, x) => s + x, 0) / arr.length
        setNoiseCalibAvg(avg)
        if (avg > NOISE_RMS_THRESHOLD) setPhase('noise_warn')
        else startSessionFromCalib()
      }
    }
    requestAnimationFrame(tick)
    return () => {
      stop = true
    }
  }, [phase, startSessionFromCalib])

  const onWelcomeStart = () => {
    setModalExiting(true)
    window.setTimeout(() => {
      setModalOpen(false)
      experienceT0.current = performance.now()
      setPhase('entering')
    }, MODAL_FADE_MS)
  }

  const onSkipToSite = () => {
    setModalOpen(false)
    setPhase('skipped')
  }

  const onMicStart = async () => {
    const a = new AudioAnalyzer()
    analyzerRef.current = a
    const ok = await a.start()
    if (!ok) {
      setPhase('mic_denied')
      return
    }
    setPhase('noise_calib')
  }

  const onNoiseContinue = () => {
    startSessionFromCalib()
  }

  const onDiscover = () => {
    setResultVisible(false)
    setBgMigrated(true)
    setDissolveV((v) => v + 1)
    analyzerRef.current?.stop()
  }

  const onDissolveBurstEnd = () => {
    window.setTimeout(() => setSiteVisible(true), 120)
  }

  const onFpsLow = useCallback(() => {
    setIcosaDetail((d) => Math.max(2, d - 1))
    setBloom(false)
  }, [])

  const goToSite = () => {
    analyzerRef.current?.stop()
    setPhase('skipped')
  }

  const micReactive = phase === 'session'
  const showProgress = phase === 'session'
  const showInstruction =
    phase === 'await_mic' ||
    phase === 'noise_calib' ||
    phase === 'noise_warn' ||
    phase === 'session' ||
    (phase === 'result' && !resultVisible)

  const resultWarm = phase === 'result'

  let instructionText = ''
  if (phase === 'await_mic') instructionText = 'Respira normalmente'
  if (phase === 'noise_calib') instructionText = 'Stiamo ascoltando il rumore di fondo…'
  if (phase === 'noise_warn') instructionText = 'Ambiente un po’ rumoroso'
  if (phase === 'session') instructionText = 'Respira normalmente per un minuto…'
  if (phase === 'result' && !resultVisible) instructionText = ''

  const sphereEntrance =
    phase === 'welcome' || (modalOpen && !modalExiting) ? 0 : phase === 'skipped' ? 1 : entrance

  const showCanvas = phase !== 'skipped'

  return (
    <main
      className={`relative min-h-dvh w-full overflow-hidden font-sans transition-colors duration-[2000ms] ${
        bgMigrated ? 'bg-cave-dark' : 'bg-cave-black'
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at 50% 38%, #1a1812 0%, #0a0a08 62%)',
        }}
      />

      {showCanvas && (
        <div className="absolute inset-0 z-0 min-h-dvh">
          {webgl ? (
            <BreathingSphere
              rmsRef={rmsRef}
              micReactive={micReactive}
              detail={icosaDetail}
              bloom={bloom}
              entrance={sphereEntrance}
              dissolveVersion={dissolveV}
              resultWarm={resultWarm}
              onFpsLow={onFpsLow}
              onDissolveBurstEnd={onDissolveBurstEnd}
            />
          ) : (
            <FallbackOrb />
          )}
        </div>
      )}

      <div
        className={`pointer-events-none absolute left-1/2 top-[calc(38%+min(36vw,140px))] z-[2] w-[min(92vw,420px)] -translate-x-1/2 text-center font-display text-[clamp(1.5rem,3vw,2.25rem)] font-light leading-tight tracking-wide text-text-primary transition-opacity duration-700 ${
          showInstruction ? 'opacity-90' : 'opacity-0'
        }`}
      >
        {showInstruction && instructionText ? <span>{instructionText}</span> : null}
      </div>

      <ProgressArc progress={sessionProgress} visible={showProgress} />

      {phase === 'await_mic' && (
        <div className="absolute bottom-[calc(22%+env(safe-area-inset-bottom))] left-1/2 z-[3] -translate-x-1/2">
          <button
            type="button"
            onClick={onMicStart}
            className="rounded-full border border-salt-pink bg-transparent px-8 py-3 font-sans text-sm font-medium text-salt-pink transition-colors duration-300 hover:bg-salt-pink hover:text-cave-black"
          >
            Inizia
          </button>
        </div>
      )}

      {phase === 'noise_warn' && (
        <div className="absolute bottom-[calc(18%+env(safe-area-inset-bottom))] left-1/2 z-[3] flex w-[min(92vw,360px)] -translate-x-1/2 flex-col gap-3 text-center">
          <p className="font-sans text-sm text-text-secondary">
            Il rumore di fondo è alto (~{(noiseCalibAvg ?? 0).toFixed(2)} RMS). Per un risultato più affidabile prova in
            un luogo più silenzioso.
          </p>
          <button
            type="button"
            onClick={onNoiseContinue}
            className="rounded-full border border-salt-pink bg-transparent px-6 py-2.5 font-sans text-sm font-medium text-salt-pink hover:bg-salt-pink hover:text-cave-black"
          >
            Continua comunque
          </button>
          <button type="button" onClick={goToSite} className="font-sans text-xs text-text-muted underline-offset-2 hover:underline">
            Vai al sito
          </button>
        </div>
      )}

      {insight && (
        <BreathResult insight={insight} visible={resultVisible && phase === 'result'} onDiscover={onDiscover} />
      )}

      {phase === 'mic_denied' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-cave-black/90 px-6 text-center">
          <p className="max-w-md font-sans text-text-secondary">
            Non abbiamo accesso al microfono. Puoi comunque scoprire la nostra grotta sul sito.
          </p>
          <button
            type="button"
            onClick={goToSite}
            className="rounded-full border border-salt-pink bg-transparent px-8 py-3 font-sans text-sm font-medium text-salt-pink hover:bg-salt-pink hover:text-cave-black"
          >
            Vai al sito
          </button>
        </div>
      )}

      {phase === 'breath_fail' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-cave-black/90 px-6 text-center">
          <p className="max-w-md font-sans text-text-secondary">
            Non siamo riusciti a rilevare il tuo respiro con chiarezza. Prova in un ambiente più silenzioso, o prosegui
            verso il nostro sito.
          </p>
          <button
            type="button"
            onClick={goToSite}
            className="rounded-full border border-salt-pink bg-salt-pink px-8 py-3 font-sans text-sm font-medium text-cave-black hover:opacity-90"
          >
            Vai al sito
          </button>
        </div>
      )}

      {(phase === 'skipped' || siteVisible) && (
        <section
          id="sito-standard"
          className={`relative z-10 flex min-h-dvh flex-col items-center justify-center bg-cave-dark px-6 text-center ${
            siteVisible ? 'animate-site-up' : ''
          }`}
        >
          <h2 className="max-w-lg font-display text-[clamp(1.5rem,4vw,2.25rem)] font-light leading-snug tracking-wide text-salt-warm">
            45 minuti nella nostra grotta = 3 giorni di mare
          </h2>
          <p className="mt-4 max-w-md font-sans text-sm text-text-secondary">
            Continua a seguirci — il sito completo è in arrivo
          </p>
        </section>
      )}

      <p className="absolute bottom-[calc(10px+env(safe-area-inset-bottom))] left-1/2 z-[4] w-[min(92vw,520px)] -translate-x-1/2 px-3 text-center font-sans text-xs leading-snug text-text-muted">
        Questa analisi non è una diagnosi medica
      </p>

      {modalOpen && (
        <WelcomeModal open={modalOpen} exiting={modalExiting} onStart={onWelcomeStart} onSkipToSite={onSkipToSite} />
      )}
    </main>
  )
}
