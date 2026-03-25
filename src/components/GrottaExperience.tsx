'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AudioAnalyzer } from '@/lib/AudioAnalyzer'
import { BreathCycleDetector, summarizeBreaths } from '@/lib/breathAnalysis'
import { getBreathMessage, type BreathInsight } from '@/lib/breathPatterns'
import { easeOutExpoBezier } from '@/lib/easing'
import { routes } from '@/lib/routes'
import { VoiceRingCanvas } from '@/components/VoiceRingCanvas'
import { SessionTimer } from '@/components/SessionTimer'
import { BreathResult } from '@/components/BreathResult'

const RING_DELAY_MS = 200
const RING_IN_MS = 1200
const NOISE_PRE_MS = 2000
const SESSION_MS = 60_000
const NOISE_RMS_THRESHOLD = 0.11
const MIN_CYCLES = 5
const SETTLE_MS = 2500

type Phase =
  | 'entering'
  | 'await_mic'
  | 'noise_calib'
  | 'noise_warn'
  | 'session'
  | 'settling'
  | 'result'
  | 'mic_denied'
  | 'breath_fail'

export function GrottaExperience() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('entering')
  const [entrance, setEntrance] = useState(0)
  const [sessionProgress, setSessionProgress] = useState(0)
  const [insight, setInsight] = useState<BreathInsight | null>(null)
  const [resultVisible, setResultVisible] = useState(false)
  const [staggerStep, setStaggerStep] = useState(0)
  const [dissolveV, setDissolveV] = useState(0)
  const [bgMigrated, setBgMigrated] = useState(false)
  const [noiseCalibAvg, setNoiseCalibAvg] = useState<number | null>(null)
  const [micOnSince, setMicOnSince] = useState<number | null>(null)
  const [calmResult, setCalmResult] = useState(false)
  const [settlingP, setSettlingP] = useState<number | null>(null)
  const [timerFlash, setTimerFlash] = useState(false)
  const [timerHide, setTimerHide] = useState(false)
  const [instructionVisible, setInstructionVisible] = useState(false)
  const [iniziaVisible, setIniziaVisible] = useState(false)
  const [iniziaHiding, setIniziaHiding] = useState(false)
  const [resultFadingOut, setResultFadingOut] = useState(false)

  const experienceT0 = useRef<number | null>(null)
  const analyzerRef = useRef<AudioAnalyzer | null>(null)
  const detectorRef = useRef(new BreathCycleDetector())
  const sessionT0 = useRef<number | null>(null)
  const noiseSamplesRef = useRef<number[]>([])
  const rmsRef = useRef(0)
  const sessionDoneRef = useRef(false)

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
    if (phase === 'noise_calib' && micOnSince == null) {
      setMicOnSince(performance.now())
    }
  }, [phase, micOnSince])

  useEffect(() => {
    experienceT0.current = performance.now()
    window.setTimeout(() => setInstructionVisible(true), 1000)
    window.setTimeout(() => setIniziaVisible(true), 1400)

    const t0 = experienceT0.current
    let stop = false
    const tick = () => {
      if (stop) return
      const elapsed = performance.now() - t0
      let e = 0
      if (elapsed < RING_DELAY_MS) e = 0
      else e = Math.min(1, (elapsed - RING_DELAY_MS) / RING_IN_MS)
      setEntrance(easeOutExpoBezier(e))
      if (e < 1) requestAnimationFrame(tick)
      else setPhase('await_mic')
    }
    requestAnimationFrame(tick)
    return () => {
      stop = true
    }
  }, [])

  const finishSession = useCallback(() => {
    if (sessionDoneRef.current) return
    sessionDoneRef.current = true
    analyzerRef.current?.stop()
    const proc = detectorRef.current.getProcessedCycles()
    if (proc.length < MIN_CYCLES) {
      setPhase('breath_fail')
      return
    }
    const sum = summarizeBreaths(proc)
    if (!sum) {
      setPhase('breath_fail')
      return
    }
    setInsight(getBreathMessage(sum.rr, sum.ieRatio))
    setTimerFlash(true)
    window.setTimeout(() => setTimerFlash(false), 200)
    window.setTimeout(() => setTimerHide(true), 200)
    setPhase('settling')
    const settle0 = performance.now()
    const settleTick = () => {
      const u = (performance.now() - settle0) / SETTLE_MS
      if (u < 1) {
        setSettlingP(u)
        requestAnimationFrame(settleTick)
      } else {
        setSettlingP(null)
        setCalmResult(true)
      }
    }
    requestAnimationFrame(settleTick)

    window.setTimeout(() => setInstructionVisible(false), 1500)
    window.setTimeout(() => {
      setPhase('result')
      setResultVisible(true)
      setStaggerStep(1)
    }, 2000)
    window.setTimeout(() => setStaggerStep(2), 2200)
    window.setTimeout(() => setStaggerStep(3), 2500)
  }, [])

  useEffect(() => {
    if (phase !== 'session') {
      sessionDoneRef.current = false
      return
    }
    sessionT0.current = performance.now()
    setTimerHide(false)
    setTimerFlash(false)
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

  const onMicStart = async () => {
    setIniziaHiding(true)
    window.setTimeout(() => setIniziaVisible(false), 400)
    const a = new AudioAnalyzer()
    analyzerRef.current = a
    const ok = await a.start()
    if (!ok) {
      setIniziaHiding(false)
      setPhase('mic_denied')
      return
    }
    setPhase('noise_calib')
  }

  const onNoiseContinue = () => {
    startSessionFromCalib()
  }

  const onDiscover = () => {
    setResultFadingOut(true)
    window.setTimeout(() => {
      setResultVisible(false)
      setDissolveV((v) => v + 1)
    }, 400)
    window.setTimeout(() => setBgMigrated(true), 800)
    window.setTimeout(() => {
      router.push(`${routes.contenuto}?from=esperienza`)
    }, 1500)
  }

  const onDissolveComplete = () => {}

  const goToContenuto = () => {
    analyzerRef.current?.stop()
    router.push(routes.contenuto)
  }

  const micOpen = phase === 'noise_calib' || phase === 'noise_warn' || phase === 'session'
  const showTimer = phase === 'session'
  const ringReveal = entrance

  const instructionText =
    phase === 'await_mic'
      ? 'Respira normalmente'
      : phase === 'noise_calib'
        ? 'Stiamo ascoltando il rumore di fondo…'
        : phase === 'noise_warn'
          ? 'Ambiente un po’ rumoroso'
          : phase === 'session'
            ? 'Respira normalmente per un minuto…'
            : ''

  const showInstructionBlock =
    instructionVisible &&
    phase !== 'result' &&
    (phase === 'await_mic' ||
      phase === 'noise_calib' ||
      phase === 'noise_warn' ||
      phase === 'session' ||
      phase === 'settling')

  const showAwaitMicCluster =
    phase === 'await_mic' && (instructionVisible || iniziaVisible)

  const showFloatingInstruction =
    showInstructionBlock && instructionText && phase !== 'await_mic'

  return (
    <main
      className={`relative min-h-dvh w-full overflow-hidden font-sans transition-colors duration-[1200ms] ${
        bgMigrated ? 'bg-cave-dark' : 'bg-cave-black'
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at 50% 42%, #1a1812 0%, #0a0a08 62%)',
        }}
      />

      <div className="absolute inset-0 z-0 min-h-dvh">
        <VoiceRingCanvas
          rmsRef={rmsRef}
          ringEntrance={ringReveal}
          micOnSince={micOnSince}
          calmResult={calmResult}
          micOpen={micOpen}
          settlingProgress={settlingP}
          dissolveKey={dissolveV}
          onDissolveComplete={onDissolveComplete}
        />
      </div>

      <SessionTimer progress={sessionProgress} visible={showTimer} flash={timerFlash} hide={timerHide} />

      {showFloatingInstruction && (
        <div
          className={`pointer-events-none absolute left-1/2 top-[calc(42%+min(32vw,120px))] z-[2] w-[min(92vw,420px)] -translate-x-1/2 text-center font-display text-[clamp(1.5rem,3vw,2.25rem)] font-light leading-tight tracking-wide text-text-primary transition-opacity duration-[600ms] ease-out ${
            showInstructionBlock ? 'opacity-90' : 'opacity-0'
          }`}
        >
          <span>{instructionText}</span>
        </div>
      )}

      {showAwaitMicCluster && (
        <div
          className="pointer-events-none absolute inset-0 z-[3] flex flex-col items-center justify-center px-6"
          style={{ paddingBottom: 'max(5.5rem, calc(env(safe-area-inset-bottom) + 4.5rem))' }}
        >
          <div
            className={`flex w-full max-w-md flex-col items-center gap-5 text-center transition-opacity duration-[600ms] ease-out ${
              instructionVisible ? 'opacity-90' : 'opacity-0'
            }`}
          >
            {instructionVisible ? (
              <>
                <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-light leading-tight tracking-wide text-text-primary">
                  Respira normalmente
                </h2>
                <p className="max-w-[28rem] font-sans text-sm leading-relaxed text-text-secondary">
                  Ti chiederemo il microfono per un attimo di calibrazione del rumore di fondo. Poi l&apos;anello ti
                  accompagnerà per circa un minuto: non serve forzare il ritmo, segui te stesso.
                </p>
              </>
            ) : null}
          </div>
          {instructionVisible && (
            <div className="pointer-events-auto mt-8 flex min-h-[48px] items-center justify-center">
              {iniziaVisible ? (
                <div
                  className={`transition-all duration-500 ease-out ${
                    iniziaHiding ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
                  }`}
                >
                  <button
                    type="button"
                    onClick={onMicStart}
                    className="rounded-full border border-salt-pink bg-transparent px-8 py-3 font-sans text-sm font-medium text-salt-pink transition-colors duration-300 hover:bg-salt-pink hover:text-cave-black"
                  >
                    Inizia
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {phase === 'noise_warn' && (
        <div className="absolute bottom-[calc(16%+env(safe-area-inset-bottom))] left-1/2 z-[3] flex w-[min(92vw,360px)] -translate-x-1/2 flex-col gap-3 text-center">
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
          <button
            type="button"
            onClick={goToContenuto}
            className="font-sans text-xs text-text-muted underline-offset-2 hover:underline"
          >
            Vai al sito
          </button>
        </div>
      )}

      {insight && (
        <div className={resultFadingOut ? 'opacity-0 transition-opacity duration-[400ms]' : ''}>
          <BreathResult
            insight={insight}
            visible={resultVisible && phase === 'result'}
            staggerStep={staggerStep}
            onDiscover={onDiscover}
          />
        </div>
      )}

      {phase === 'mic_denied' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-cave-black/90 px-6 text-center">
          <p className="max-w-md font-sans text-text-secondary">
            Non abbiamo accesso al microfono. Puoi comunque scoprire la nostra grotta sul sito.
          </p>
          <button
            type="button"
            onClick={goToContenuto}
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
            onClick={goToContenuto}
            className="rounded-full border border-salt-pink bg-salt-pink px-8 py-3 font-sans text-sm font-medium text-cave-black hover:opacity-90"
          >
            Vai al sito
          </button>
        </div>
      )}

      <p className="absolute bottom-[calc(10px+env(safe-area-inset-bottom))] left-1/2 z-[4] w-[min(92vw,520px)] -translate-x-1/2 px-3 text-center font-sans text-xs leading-snug text-text-muted">
        Questa analisi non è una diagnosi medica
      </p>
    </main>
  )
}
