import { useCallback, useEffect, useRef, useState } from 'react'
import { EntryModal } from './EntryModal'
import { ProgressRing } from './ProgressRing'
import { useMicrophoneRMS } from '../hooks/useMicrophoneRMS'
import { useAmbientSound } from '../hooks/useAmbientSound'
import {
  createSaltSphereScene,
  recommendedIcosaDetail,
  shouldUseCssFallback,
  type SaltSceneAPI,
  type SaltSceneFrameState,
} from '../three/saltSphereScene'
import './GrottaIntro.css'

const MODAL_FADE_MS = 800
const SPHERE_DELAY_MS = 200
const SPHERE_IN_MS = 1200
const SESSION_MS = 60_000

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

function instructionForSessionSeconds(t: number): string {
  if (t < 5) return 'INSPIRA…'
  if (t < 10) return 'ESPIRA…'
  if (t < 15) return 'INSPIRA…'
  if (t < 20) return 'ESPIRA…'
  return 'Respira con naturalezza.'
}

export function IntroExperience() {
  const useWebGL = !shouldUseCssFallback()
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<SaltSceneAPI | null>(null)
  const clickRef = useRef<number | null>(null)
  const phaseRef = useRef<'welcome' | 'grotta' | 'result' | 'nav'>('welcome')
  const rmsRef = useRef(0)
  const progressRef = useRef(0)

  const [phase, setPhase] = useState<'welcome' | 'grotta' | 'result' | 'nav'>('welcome')
  const [modalExiting, setModalExiting] = useState(false)
  const [sceneMounted, setSceneMounted] = useState(false)
  const [ambientOn, setAmbientOn] = useState(false)
  const [instruction, setInstruction] = useState('')
  const [instructionFade, setInstructionFade] = useState(false)
  const [sessionProgress, setSessionProgress] = useState(0)
  const [navBg, setNavBg] = useState(false)
  const [dissolving, setDissolving] = useState(false)
  const dissolveStartedRef = useRef(false)

  const micActive = phase === 'grotta'
  const { rms, error: micError } = useMicrophoneRMS(micActive)
  useAmbientSound(ambientOn && phase !== 'welcome')

  useEffect(() => {
    rmsRef.current = rms
  }, [rms])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  const beginSession = useCallback(() => {
    clickRef.current = performance.now()
    setSceneMounted(true)
    setModalExiting(true)
    window.setTimeout(() => {
      setPhase('grotta')
      setInstruction('INSPIRA…')
      setInstructionFade(false)
    }, MODAL_FADE_MS)
  }, [])

  useEffect(() => {
    if (!sceneMounted || !useWebGL || !hostRef.current) return
    const el = hostRef.current
    const enableBloom = typeof window !== 'undefined' && window.innerWidth >= 768
    const api = createSaltSphereScene(el, {
      detail: recommendedIcosaDetail(),
      enableBloom,
    })
    sceneRef.current = api

    const ro = new ResizeObserver(() => {
      if (!hostRef.current) return
      const r = hostRef.current.getBoundingClientRect()
      api.setSize(r.width, r.height)
    })
    const parent = el.parentElement
    if (parent) ro.observe(parent)
    const rect = el.getBoundingClientRect()
    api.setSize(rect.width, rect.height)

    return () => {
      ro.disconnect()
      api.dispose()
      sceneRef.current = null
    }
  }, [sceneMounted, useWebGL])

  useEffect(() => {
    if (!sceneMounted) return
    let id = 0

    const loop = () => {
      const now = performance.now()
      const click = clickRef.current
      const ph = phaseRef.current

      if (click != null && sceneRef.current) {
        const elapsed = now - click
        const entranceT =
          elapsed < SPHERE_DELAY_MS ? 0 : Math.min(1, (elapsed - SPHERE_DELAY_MS) / SPHERE_IN_MS)
        const entrance = easeOutCubic(entranceT)

        let warmth = 0
        let breathSpeed = 1
        const sphereScale = 0.5 + 0.5 * entrance
        let sphereOpacity = entrance

        if (ph === 'result' || ph === 'nav') {
          warmth = ph === 'result' ? 0.92 : 0.5
          breathSpeed = ph === 'result' ? 0.32 : 0.18
        }

        if (ph === 'nav') {
          sphereOpacity = 0
        }

        const sessionStart = click + SPHERE_DELAY_MS + SPHERE_IN_MS

        if (ph === 'grotta' && now >= sessionStart) {
          const sessionSec = (now - sessionStart) / 1000
          const p = Math.min(1, sessionSec / (SESSION_MS / 1000))
          if (Math.abs(p - progressRef.current) > 0.003) {
            progressRef.current = p
            setSessionProgress(p)
          }
        } else {
          progressRef.current = 0
        }

        let rmsVal = 0
        if (ph === 'grotta') rmsVal = rmsRef.current
        else if (ph === 'result') rmsVal = rmsRef.current * 0.2

        const state: SaltSceneFrameState = {
          rms: rmsVal,
          breathSpeed,
          warmth,
          sphereScale: ph === 'nav' ? 0.01 : sphereScale,
          sphereOpacity: ph === 'nav' ? 0 : sphereOpacity,
        }

        sceneRef.current.setState(state)
      }

      id = requestAnimationFrame(loop)
    }

    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [sceneMounted])

  useEffect(() => {
    if (phase !== 'grotta') return
    const click = clickRef.current
    if (click == null) return
    const wait = SESSION_MS + SPHERE_DELAY_MS + SPHERE_IN_MS
    const elapsed = performance.now() - click
    const remaining = Math.max(0, wait - elapsed)
    const t = window.setTimeout(() => setPhase('result'), remaining)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase !== 'grotta') return
    const id = window.setInterval(() => {
      const click = clickRef.current
      if (click == null) return
      const sessionStart = click + SPHERE_DELAY_MS + SPHERE_IN_MS
      const sessionSec = Math.max(0, (performance.now() - sessionStart) / 1000)
      if (sessionSec * 1000 >= SESSION_MS) return
      const next = instructionForSessionSeconds(sessionSec)
      setInstruction((prev) => {
        if (prev === next) return prev
        setInstructionFade(true)
        window.setTimeout(() => {
          setInstruction(next)
          setInstructionFade(false)
        }, 680)
        return prev
      })
    }, 550)
    return () => clearInterval(id)
  }, [phase])

  const onContinue = useCallback(() => {
    if (dissolveStartedRef.current) return
    dissolveStartedRef.current = true
    setDissolving(true)
    sceneRef.current?.startDissolve(() => {
      setPhase('nav')
      setNavBg(true)
      setDissolving(false)
    })
  }, [])

  const showRing = phase === 'grotta'
  const showInstruction = phase === 'grotta'
  const showFallback = sceneMounted && !useWebGL

  return (
    <div className={`grotta${navBg ? ' grotta--nav-bg' : ''}`}>
      <div ref={hostRef} className="grotta__canvas-host" aria-hidden="true" />
      {showFallback && <div className="grotta__fallback-sphere" />}

      {phase === 'welcome' && <EntryModal exiting={modalExiting} onEnter={beginSession} />}

      {phase !== 'welcome' && (
        <button
          type="button"
          className={`grotta__audio-toggle${ambientOn ? ' grotta__audio-toggle--on' : ''}`}
          onClick={() => setAmbientOn((v) => !v)}
          aria-pressed={ambientOn}
          title={ambientOn ? 'Disattiva suoni' : 'Attiva suoni ambientali'}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            {ambientOn ? (
              <>
                <path d="M11 5L6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15.54 8.46a5 5 0 010 7.07" strokeLinecap="round" />
                <path d="M17.66 6.34a8 8 0 010 11.32" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M11 5L6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 9l-6 6M16 9l6 6" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      )}

      <ProgressRing progress={sessionProgress} visible={showRing} />

      {showInstruction && (
        <div className={`grotta__instruction${instructionFade ? ' grotta__instruction--fade' : ''}`}>
          <span>{instruction || '\u00a0'}</span>
        </div>
      )}

      {phase === 'result' && !dissolving && (
        <div className="grotta__result-block">
          <h2 className="grotta__result-title">Sei arrivato</h2>
          <p className="grotta__result-body">
            Il respiro si è fatto spazio. Da qui puoi proseguire verso il percorso — al tuo ritmo.
          </p>
          <button type="button" className="grotta__result-cta" onClick={onContinue}>
            Continua
          </button>
        </div>
      )}

      {phase === 'nav' && (
        <div className="nav-shell">
          <h2 className="nav-shell__title">Percorso</h2>
          <p className="nav-shell__muted">Area principale (MVP)</p>
        </div>
      )}

      <p className="grotta__disclaimer">
        Esperienza di benessere generale, non sostituisce parere medico. Interrompi se ti senti a disagio.
        {phase === 'grotta' && micError ? (
          <span className="grotta__disclaimer-warn"> Microfono: {micError} — la sfera continuerà a respirare in silenzio.</span>
        ) : null}
      </p>
    </div>
  )
}
