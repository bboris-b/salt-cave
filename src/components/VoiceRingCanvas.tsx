'use client'

import type { MutableRefObject } from 'react'
import { useEffect, useRef } from 'react'
import { createNoise3D } from 'simplex-noise'
import { easeOutExpoBezier, mapRange } from '@/lib/easing'
import { RING_POINT_COUNT, breathWaveshape, buildRingPath, idleDisplacement } from '@/lib/ringPath'

const COL_PINK = '#D4967A'
const COL_GLOW = '#F0D4B8'

/** Curva per rendere visibili RMS bassi (~0.02–0.12) senza saturare sui picchi. */
function visualLevelFromRms(rms: number): number {
  const x = Math.max(0, rms)
  return Math.min(1, Math.pow(x * 20, 0.55))
}

export type VoiceRingCanvasProps = {
  rmsRef: MutableRefObject<number>
  ringEntrance: number
  /** Timestamp performance.now() alla concessione microfono; null se mai attivato */
  micOnSince: number | null
  /** Dopo il settling, anello quasi fermo senza onde respiro */
  calmResult: boolean
  micOpen: boolean
  settlingProgress: number | null
  dissolveKey: number
  onDissolveComplete?: () => void
  reducedMotion?: boolean
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  opacity: number
  delayMs: number
  started: boolean
  frames: number
  ambient: boolean
  brown: number
}

export function VoiceRingCanvas({
  rmsRef,
  ringEntrance,
  micOnSince,
  calmResult,
  micOpen,
  settlingProgress,
  dissolveKey,
  onDissolveComplete,
  reducedMotion,
}: VoiceRingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const noise3D = useRef(createNoise3D(() => 0.31))
  const noiseBrown = useRef(createNoise3D(() => 0.47))
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1, cx: 0, cy: 0, rBase: 120 })
  const smoothedRmsRef = useRef(0)
  const glowDisplayRef = useRef(0.06)
  const glowSlowRef = useRef(0.06)
  const lastDissolveKey = useRef(0)
  const dissolveT0Ref = useRef<number | null>(null)
  const particlesRef = useRef<Particle[] | null>(null)
  const ringPointsSnapshot = useRef<Float32Array | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number>(0)
  const dissolveDoneRef = useRef(false)
  const ambientTaggedRef = useRef(false)

  const propsRef = useRef({
    ringEntrance,
    micOnSince,
    calmResult,
    micOpen,
    settlingProgress,
    reducedMotion: !!reducedMotion,
  })
  propsRef.current = {
    ringEntrance,
    micOnSince,
    calmResult,
    micOpen,
    settlingProgress,
    reducedMotion: !!reducedMotion,
  }

  useEffect(() => {
    const measure = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5)
      const w = Math.max(1, rect.width)
      const h = Math.max(1, rect.height)
      const vw = w
      const vh = h
      const minDim = Math.min(vw, vh)
      const isMobile = vw < 768
      let rBase = minDim * (isMobile ? 0.28 : 0.22)
      const cx = vw / 2
      const cy = vh * 0.42
      const margin = Math.min(cx, cy, vw - cx, vh - cy)
      const outerEstimate = rBase + 50 + 35 + 18
      if (outerEstimate * 1.35 > margin) {
        rBase = Math.max(minDim * 0.18, margin / 1.35 - 65)
      }
      sizeRef.current = { w, h, dpr, cx, cy, rBase }
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }

    measure()
    const onWin = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(measure, 100)
    }
    window.addEventListener('resize', onWin)
    const ro = new ResizeObserver(onWin)
    if (canvasRef.current?.parentElement) ro.observe(canvasRef.current.parentElement)
    return () => {
      window.removeEventListener('resize', onWin)
      ro.disconnect()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  useEffect(() => {
    if (dissolveKey <= 0 || dissolveKey === lastDissolveKey.current) return
    lastDissolveKey.current = dissolveKey
    dissolveT0Ref.current = performance.now()
    dissolveDoneRef.current = false
    ambientTaggedRef.current = false
    const snap = ringPointsSnapshot.current
    if (!snap || snap.length < RING_POINT_COUNT * 2) {
      particlesRef.current = []
      if (!dissolveDoneRef.current) {
        dissolveDoneRef.current = true
        onDissolveComplete?.()
      }
      return
    }
    const parts: Particle[] = []
    for (let i = 0; i < RING_POINT_COUNT; i++) {
      const angle = (2 * Math.PI * i) / RING_POINT_COUNT - Math.PI / 2
      const jitter = (Math.random() - 0.5) * 0.4
      const vr = 0.8 + Math.random() * 1.7
      const vang = (Math.random() - 0.5) * 0.3
      const vx = Math.cos(angle + vang) * vr
      const vy = Math.sin(angle + vang) * vr
      parts.push({
        x: snap[i * 2],
        y: snap[i * 2 + 1],
        vx,
        vy,
        opacity: 0.7,
        delayMs: Math.random() * 400,
        started: false,
        frames: 0,
        ambient: false,
        brown: Math.random() * 1000,
      })
    }
    particlesRef.current = parts
  }, [dissolveKey, onDissolveComplete])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const displacements = new Float32Array(RING_POINT_COUNT)
    const displacementsEcho = new Float32Array(RING_POINT_COUNT)
    const displacementsGlow = new Float32Array(RING_POINT_COUNT)

    const loop = () => {
      const now = performance.now()
      const { w, h, dpr, cx, cy, rBase } = sizeRef.current
      const {
        ringEntrance: ent,
        micOnSince: mos,
        calmResult: calm,
        micOpen: mic,
        settlingProgress: sp,
        reducedMotion: rm,
      } = propsRef.current

      const bb = calm ? 0 : mos != null ? easeOutExpoBezier(Math.min(1, (now - mos) / 1500)) : 0

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const tSec = now / 1000
      const raw = rmsRef.current
      const sr = smoothedRmsRef.current
      smoothedRmsRef.current = sr + (raw - sr) * (rm ? 0.28 : 0.26)

      const inSettling = sp != null
      const settling = sp ?? 0
      const breathMult = inSettling ? 1 - easeOutExpoBezier(Math.min(1, settling * (2 / 2.5))) : 1
      const idleAmp = inSettling ? 3 + (1.5 - 3) * easeOutExpoBezier(Math.min(1, settling)) : 3
      const effectiveBreathBlend = bb * breathMult

      const rms = smoothedRmsRef.current
      const visualLevel = visualLevelFromRms(rms)
      const micReactive = mic && bb > 0.02 && breathMult > 0.05
      const idleDamp =
        micReactive && visualLevel > 0.04 ? Math.max(0.55, 1 - visualLevel * 0.42) : 1
      const idleAmpEff = idleAmp * idleDamp

      const waveAmp = mapRange(visualLevel, 0, 1, 10, 46)
      const wave = (angle: number) =>
        effectiveBreathBlend * visualLevel * waveAmp * breathWaveshape(angle, tSec)

      const n3 = noise3D.current
      for (let i = 0; i < RING_POINT_COUNT; i++) {
        const angle = (2 * Math.PI * i) / RING_POINT_COUNT - Math.PI / 2
        const idle = idleDisplacement(n3, angle, tSec, idleAmpEff)
        displacements[i] = idle + wave(angle)
        const idleE = idleDisplacement(n3, angle, tSec - 0.8, idleAmpEff) * 0.2
        displacementsEcho[i] = idleE + wave(angle) * 0.35
        displacementsGlow[i] = displacements[i]
      }

      const activeReactive = micReactive
      let glowTarget = activeReactive ? 0.07 + visualLevel * 0.34 : 0.06
      if (inSettling) {
        glowTarget = 0.04 + (glowTarget - 0.04) * (1 - Math.min(1, settling * (2 / 2.5)))
      }
      glowDisplayRef.current += (glowTarget - glowDisplayRef.current) * 0.06
      glowSlowRef.current += (glowTarget - glowSlowRef.current) * 0.04

      const strokeMain = inSettling
        ? 1.5 + (1.0 - 1.5) * easeOutExpoBezier(Math.min(1, settling * (2 / 2.5)))
        : 1.35 + visualLevel * 2.4
      const mainOpacityIdle = 0.76 + (mic ? visualLevel * 0.22 : 0)
      const mainOpacity = Math.min(
        0.96,
        inSettling ? mainOpacityIdle * (1 - settling * 0.12) : mainOpacityIdle + (activeReactive ? visualLevel * 0.18 : 0),
      )

      const echoOp = activeReactive ? 0.07 + visualLevel * 0.14 : 0.08
      const scale = 0.7 + 0.3 * easeOutExpoBezier(ent)
      const fadeIn = ent * 0.75

      const dissolveStart = dissolveT0Ref.current
      const hideRing = dissolveStart != null && now >= dissolveStart

      const parts = particlesRef.current
      if (parts && parts.length > 0 && dissolveStart != null) {
        const age = now - dissolveStart
        if (age >= 3000 && !dissolveDoneRef.current) {
          dissolveDoneRef.current = true
          onDissolveComplete?.()
        }
        if (age >= 2200 && !ambientTaggedRef.current) {
          ambientTaggedRef.current = true
          const idx = Array.from({ length: parts.length }, (_, i) => i)
            .sort(() => Math.random() - 0.5)
            .slice(0, 30)
          for (const j of idx) {
            const p = parts[j]
            p.ambient = true
            p.opacity = 0.06 + Math.random() * 0.04
            p.vx *= 0.08
            p.vy *= 0.08
          }
        }
        for (const p of parts) {
          if (!p.started) {
            if (now - dissolveStart >= p.delayMs) p.started = true
            else continue
          }
          if (!p.ambient) {
            p.frames++
            p.vy += 0.015
            p.vx *= 0.985
            p.vy *= 0.985
            p.x += p.vx
            p.y += p.vy
            p.opacity = 0.7 * Math.pow(0.992, p.frames)
          } else {
            p.brown += 0.3
            p.x += noiseBrown.current(p.brown * 0.01, now * 0.00015, 0) * 0.3
            p.y += noiseBrown.current(p.brown * 0.01 + 33, now * 0.00015, 0) * 0.3
            const target = 0.07 + Math.sin(now * 0.001 + p.brown) * 0.02
            p.opacity += (target - p.opacity) * 0.03
          }
        }
      }

      ctx.save()
      ctx.translate(cx, cy)
      ctx.scale(scale, scale)
      ctx.translate(-cx, -cy)
      ctx.globalAlpha = fadeIn

      if (!hideRing) {
        ctx.save()
        ctx.globalAlpha = fadeIn * echoOp
        ctx.strokeStyle = COL_PINK
        ctx.lineWidth = 0.5
        buildRingPath(ctx, cx, cy, rBase + 50, displacementsEcho, true)
        ctx.stroke()
        ctx.restore()

        ctx.save()
        ctx.globalAlpha = fadeIn * glowSlowRef.current
        ctx.strokeStyle = COL_GLOW
        ctx.lineWidth = 6
        ctx.shadowBlur = 18
        ctx.shadowColor = 'rgba(240, 212, 184, 0.4)'
        buildRingPath(ctx, cx, cy, rBase, displacementsGlow, true)
        ctx.stroke()
        ctx.shadowBlur = 0
        ctx.restore()

        ctx.save()
        ctx.globalAlpha = fadeIn * mainOpacity
        ctx.strokeStyle = COL_PINK
        ctx.lineWidth = strokeMain
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        buildRingPath(ctx, cx, cy, rBase, displacements, true)
        ctx.stroke()
        ctx.restore()

        const snap = new Float32Array(RING_POINT_COUNT * 2)
        const offset = -Math.PI / 2
        for (let i = 0; i < RING_POINT_COUNT; i++) {
          const angle = (2 * Math.PI * i) / RING_POINT_COUNT + offset
          const r = rBase + displacements[i]
          snap[i * 2] = cx + Math.cos(angle) * r
          snap[i * 2 + 1] = cy + Math.sin(angle) * r
        }
        ringPointsSnapshot.current = snap
      }

      ctx.restore()

      if (parts && parts.length > 0) {
        ctx.save()
        for (const p of parts) {
          if (!p.started) continue
          ctx.fillStyle = COL_PINK
          ctx.globalAlpha = Math.min(1, Math.max(0, p.opacity))
          ctx.beginPath()
          ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [rmsRef, onDissolveComplete])

  return <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden />
}
