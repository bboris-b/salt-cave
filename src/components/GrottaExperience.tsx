'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AudioAnalyzer, type AudioStartFailureReason } from '@/lib/AudioAnalyzer'
import { BreathCycleDetector, summarizeBreaths } from '@/lib/breathAnalysis'
import { getBreathMessage, type BreathInsight } from '@/lib/breathPatterns'
import { easeOutExpoBezier } from '@/lib/easing'
import { routes } from '@/lib/routes'
import { VoiceRingCanvas } from '@/components/VoiceRingCanvas'
import { SessionTimer } from '@/components/SessionTimer'
import { BreathResult } from '@/components/BreathResult'
import { useAtmosphereRefs } from '@/components/AtmosphereProvider'
import { ATMOSPHERE_COLORS, DEFAULT_ATMOSPHERE_STATE, type AtmospherePhase } from '@/lib/atmosphereTypes'

const RING_DELAY_MS = 200
const RING_IN_MS = 1200
const NOISE_PRE_MS = 2000
const SESSION_MS = 60_000
const NOISE_RMS_THRESHOLD = 0.11
const MIN_CYCLES = 3
const SETTLE_MS = 2500

function micDeniedCopy(reason: AudioStartFailureReason | null): string {
  switch (reason) {
    case 'no_audio_track':
      return 'Il browser non ha trovato un microfono nel dispositivo. Collega un microfono o controlla le impostazioni di sistema, poi riprova.'
    case 'track_not_live':
      return 'La sorgente microfono non risulta attiva. Chiudi altre app che usano il microfono e riprova.'
    case 'audio_context_blocked':
      return 'L’audio della pagina non è partito (spesso serve un secondo tocco sullo schermo). Tocca di nuovo «Riprova» o ricarica la pagina.'
    case 'permission_denied':
    default:
      return 'Non abbiamo accesso al microfono. Puoi comunque scoprire la nostra grotta sul sito.'
  }
}

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
  const [micBlockReason, setMicBlockReason] = useState<AudioStartFailureReason | null>(null)

  const experienceT0 = useRef<number | null>(null)
  const analyzerRef = useRef<AudioAnalyzer | null>(null)
  const detectorRef = useRef(new BreathCycleDetector())
  const sessionT0 = useRef<number | null>(null)
  const noiseSamplesRef = useRef<number[]>([])
  const rmsRef = useRef(0)
  const breathEnvRef = useRef(0)
  const sessionDoneRef = useRef(false)
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const bgMigratedRef = useRef(bgMigrated)
  bgMigratedRef.current = bgMigrated
  const dissolveVRef = useRef(dissolveV)
  dissolveVRef.current = dissolveV
  const settlingPRef = useRef(settlingP)
  settlingPRef.current = settlingP

  const atmo = useAtmosphereRefs()

  useEffect(() => {
    let id = 0
    const loop = () => {
      const a = analyzerRef.current
      if (a) {
        const s = a.getSmoothedRMS()
        const r = a.getLastRawRMS()
        rmsRef.current = Math.max(s, r * 0.94)
      } else {
        rmsRef.current = 0
      }

      if (atmo) {
        const rms = rmsRef.current
        atmo.stateRef.current.breathAmplitude = Math.min(1, Math.pow(rms * 11, 0.62))
        const ph = phaseRef.current
        let ap: AtmospherePhase = 'idle'
        if (bgMigratedRef.current || dissolveVRef.current > 0) {
          ap = 'dissolving'
          atmo.bgTargetRef.current = ATMOSPHERE_COLORS.baseDissolve
        } else {
          atmo.bgTargetRef.current = ATMOSPHERE_COLORS.base
          if (ph === 'settling') {
            ap = 'settling'
            atmo.stateRef.current.settlingBlend = settlingPRef.current ?? 0
          } else if (
            ph === 'noise_calib' ||
            ph === 'noise_warn' ||
            ph === 'session' ||
            ph === 'result'
          ) {
            ap = 'active'
          }
        }
        atmo.stateRef.current.phase = ap
      }

      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(id)
      if (atmo) {
        atmo.stateRef.current = { ...DEFAULT_ATMOSPHERE_STATE }
      }
    }
  }, [atmo])

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
    breathEnvRef.current = 0
    setTimerHide(false)
    setTimerFlash(false)
    let stop = false
    const tick = () => {
      if (stop || !sessionT0.current) return
      const elapsed = performance.now() - sessionT0.current
      const p = Math.min(1, elapsed / SESSION_MS)
      setSessionProgress(p)
      const tSec = elapsed / 1000
      const a = analyzerRef.current
      const rawMix = a ? Math.max(a.getSmoothedRMS(), a.getLastRawRMS()) : 0
      /* Inviluppo: attacco veloce sui picchi (respiro breve), rilascio lento — evita picchi persi nel lisciamento. */
      breathEnvRef.current = Math.max(rawMix * 1.18, breathEnvRef.current * 0.84)
      detectorRef.current.processSample(breathEnvRef.current, tSec)
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
    const result = await a.start()
    if (!result.ok) {
      a.stop()
      analyzerRef.current = null
      setIniziaHiding(false)
      setIniziaVisible(true)
      setMicBlockReason(result.reason)
      setPhase('mic_denied')
      return
    }
    setMicBlockReason(null)
    setPhase('noise_calib')
  }

  const retryMic = () => {
    setMicBlockReason(null)
    setPhase('await_mic')
    setIniziaVisible(true)
    setIniziaHiding(false)
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

  const instructionSubline =
    phase === 'session'
      ? "L'anello reagisce al volume che entra nel microfono. Se lo vedi quasi fermo, avvicinati o prova un «sss» tenue; cuffie o auricolari evitano che il suono delle casse copra il respiro."
      : phase === 'noise_calib'
        ? 'Cuffie o auricolari evitano che il suono delle casse torni nel microfono e rendono la lettura più stabile.'
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
    <main className="relative min-h-dvh w-full overflow-hidden bg-transparent font-sans">
      <div className="absolute inset-0 z-0 min-h-dvh">
        <VoiceRingCanvas
          rmsRef={rmsRef}
          ringEntrance={ringReveal}
          micOnSince={micOnSince}
          calmResult={calmResult}
          micOpen={micOpen}
          settlingProgress={settlingP}
          ambientOrganicMotion={phase === 'settling' || phase === 'result'}
          dissolveKey={dissolveV}
          onDissolveComplete={onDissolveComplete}
        />
      </div>

      <SessionTimer progress={sessionProgress} visible={showTimer} flash={timerFlash} hide={timerHide} />

      {showFloatingInstruction && (
        <div
          className={`pointer-events-none absolute left-1/2 top-[calc(42%+min(32vw,120px))] z-[2] w-[min(92vw,420px)] -translate-x-1/2 text-center transition-opacity duration-[600ms] ease-out ${
            showInstructionBlock ? 'opacity-90' : 'opacity-0'
          }`}
        >
          <span className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-light leading-tight tracking-wide text-text-primary">
            {instructionText}
          </span>
          {instructionSubline ? (
            <p className="mx-auto mt-4 max-w-[26rem] font-sans text-xs leading-relaxed text-text-muted">
              {instructionSubline}
            </p>
          ) : null}
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
                  accompagnerà per circa un minuto: non serve forzare il ritmo, segui te stesso.{' '}
                  <span className="text-text-muted">
                    Se puoi, usa cuffie o auricolari: riducono il ritorno audio dalle casse e il cerchio risponde in
                    modo più chiaro.
                  </span>
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
            un luogo più silenzioso e, se puoi, cuffie o auricolari per evitare che il suono del dispositivo entri nel
            microfono.
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
          <p className="max-w-md font-sans text-text-secondary">{micDeniedCopy(micBlockReason)}</p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={retryMic}
              className="rounded-full border border-salt-pink bg-salt-pink px-8 py-3 font-sans text-sm font-medium text-cave-black hover:opacity-90"
            >
              Riprova
            </button>
            <button
              type="button"
              onClick={goToContenuto}
              className="rounded-full border border-salt-pink bg-transparent px-8 py-3 font-sans text-sm font-medium text-salt-pink hover:bg-salt-pink hover:text-cave-black"
            >
              Vai al sito
            </button>
          </div>
        </div>
      )}

      {phase === 'breath_fail' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-cave-black/90 px-6 text-center">
          <p className="max-w-md font-sans text-text-secondary">
            Non siamo riusciti a rilevare il tuo respiro con chiarezza. Prova in un ambiente più silenzioso, con cuffie o
            auricolari (evitano che le casse coprano il microfono) e microfono più vicino alla bocca; altrimenti puoi
            proseguire verso il nostro sito.
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
