'use client'

import { useEffect, useRef, useState } from 'react'
import { createWarmLights, drawWarmLight } from '@/lib/atmosphereLights'
import type { WarmLight } from '@/lib/atmosphereLights'
import { ATMOSPHERE_COLORS } from '@/lib/atmosphereTypes'
import { createSaltParticles, updateAndDrawSaltParticles } from '@/lib/atmosphereParticles'
import type { SaltParticle } from '@/lib/atmosphereParticles'
import { hexToRgb, lerpRgb, rgbToCss } from '@/lib/atmosphereColor'
import { easeStandard } from '@/lib/easing'
import { ParallaxController } from '@/lib/parallax'
import type { AtmosphereContextValue } from './AtmosphereProvider'
import { useAtmosphereRefs } from './AtmosphereProvider'
import type { AtmosphereState } from '@/lib/atmosphereTypes'
import { useSmoothScroll } from '@/providers/SmoothScrollContext'
import { AtmosphereCssFallback } from '@/components/AtmosphereCssFallback'

const MAX_DPR = 2
const RESIZE_DEBOUNCE_MS = 100
const BG_LERP_MS = 1500
const DEPTH_RADIUS_FRAC = 0.6
const CENTRAL_GLOW_RADIUS_FRAC = 0.22
const VIGNETTE_INNER_FRAC = 0.15
const VIGNETTE_OUTER_FRAC = 0.6

function centralGlowOpacity(state: AtmosphereState): number {
  const b = Math.min(1, Math.max(0, state.breathAmplitude))
  switch (state.phase) {
    case 'active':
      return 0.03 + b * 0.02
    case 'settling': {
      const u = Math.min(1, Math.max(0, state.settlingBlend))
      const peak = 0.03 + b * 0.02
      return 0.02 + (peak - 0.02) * (1 - u)
    }
    case 'dissolving':
      return 0.028
    default:
      return 0.034
  }
}

export function AtmosphericBackground() {
  const [canvasFailed, setCanvasFailed] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const apiRef = useRef<AtmosphereContextValue | null>(null)
  const lightsRef = useRef<WarmLight[]>([])
  const particlesRef = useRef<SaltParticle[]>([])
  const particleCountRef = useRef(56)
  const parallaxRef = useRef<ParallaxController | null>(null)
  const lastFrameTsRef = useRef(0)
  const fpsSamplesRef = useRef<number[]>([])
  const displayRgbRef = useRef(hexToRgb(ATMOSPHERE_COLORS.base))
  const bgTransitionRef = useRef<{
    from: { r: number; g: number; b: number }
    to: { r: number; g: number; b: number }
    start: number
    active: boolean
  } | null>(null)
  const lastBgTargetRef = useRef('#0A0A08')

  const atmosphere = useAtmosphereRefs()
  const smooth = useSmoothScroll()
  const smoothRef = useRef(smooth)
  smoothRef.current = smooth
  apiRef.current = atmosphere

  useEffect(() => {
    if (!atmosphere || canvasFailed) return
    lightsRef.current = createWarmLights()
    parallaxRef.current = new ParallaxController()
    const detach = parallaxRef.current.attachWindowListeners()

    const canvas = canvasRef.current
    if (!canvas) {
      detach()
      return
    }

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) {
      detach()
      setCanvasFailed(true)
      return
    }

    let debounce: ReturnType<typeof setTimeout> | null = null
    const size = { w: 0, h: 0, dpr: 1 }

    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const w = window.innerWidth
      const h = window.innerHeight
      size.w = w
      size.h = h
      size.dpr = dpr
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particlesRef.current = createSaltParticles(particleCountRef.current, w, h)
    }

    measure()
    const onResize = () => {
      if (debounce) clearTimeout(debounce)
      debounce = setTimeout(measure, RESIZE_DEBOUNCE_MS)
    }
    window.addEventListener('resize', onResize)

    let raf = 0
    const loop = (ts: number) => {
      const parallax = parallaxRef.current
      const atmo = apiRef.current
      if (!parallax || !atmo) {
        raf = requestAnimationFrame(loop)
        return
      }

      const dt = lastFrameTsRef.current ? (ts - lastFrameTsRef.current) / 1000 : 0.016
      lastFrameTsRef.current = ts

      const samples = fpsSamplesRef.current
      samples.push(dt)
      if (samples.length > 24) samples.shift()
      if (samples.length >= 12) {
        const avg = samples.reduce((a, b) => a + b, 0) / samples.length
        if (avg > 0.022 && particleCountRef.current > 30) {
          particleCountRef.current = 30
          particlesRef.current = createSaltParticles(30, size.w, size.h)
        }
      }

      parallax.tick()
      const { ox: mox, oy: moy } = parallax.offsetMain()
      const { ox: gox, oy: goy } = parallax.offsetGlow()

      const state = atmo.stateRef.current
      const targetHex = atmo.bgTargetRef.current
      if (targetHex !== lastBgTargetRef.current) {
        lastBgTargetRef.current = targetHex
        bgTransitionRef.current = {
          from: { ...displayRgbRef.current },
          to: hexToRgb(targetHex),
          start: ts,
          active: true,
        }
      }
      const tr = bgTransitionRef.current
      if (tr?.active) {
        const u = Math.min(1, (ts - tr.start) / BG_LERP_MS)
        const e = easeStandard(u)
        displayRgbRef.current = lerpRgb(tr.from, tr.to, e)
        if (u >= 1) tr.active = false
      }

      const { w, h, dpr } = size
      if (w < 1 || h < 1) {
        raf = requestAnimationFrame(loop)
        return
      }

      const sScroll = smoothRef.current
      const reducedMotion = sScroll?.reducedMotion ?? false
      const scrollProgress = sScroll?.progress ?? 0
      const scrollParallaxScale = 0.3
      const scrollOy = -scrollProgress * Math.min(h, w) * 0.12 * scrollParallaxScale

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = rgbToCss(displayRgbRef.current)
      ctx.fillRect(0, 0, w, h)

      const depthCx = w * (0.5 + mox * 0.16)
      const depthCy = h * (0.43 + moy * 0.16)
      const depthR = w * DEPTH_RADIUS_FRAC
      const gDepth = ctx.createRadialGradient(depthCx, depthCy, 0, depthCx, depthCy, depthR)
      const wg = ATMOSPHERE_COLORS.warmGray
      const wr = parseInt(wg.slice(1, 3), 16)
      const wg_g = parseInt(wg.slice(3, 5), 16)
      const wb = parseInt(wg.slice(5, 7), 16)
      gDepth.addColorStop(0, `rgba(${wr},${wg_g},${wb},0.35)`)
      gDepth.addColorStop(1, 'rgba(10,10,8,0)')
      ctx.fillStyle = gDepth
      ctx.fillRect(0, 0, w, h)

      const tSec = ts / 1000
      for (const L of lightsRef.current) {
        drawWarmLight(ctx, L, tSec, w, h, mox, moy)
      }

      const ringCx = w * (0.5 + gox * 0.1)
      const ringCy = h * (0.42 + goy * 0.1)
      const ringR = w * CENTRAL_GLOW_RADIUS_FRAC
      const gGlow = ctx.createRadialGradient(ringCx, ringCy, 0, ringCx, ringCy, ringR)
      const gl = ATMOSPHERE_COLORS.glowLight
      const lr = parseInt(gl.slice(1, 3), 16)
      const lg = parseInt(gl.slice(3, 5), 16)
      const lb = parseInt(gl.slice(5, 7), 16)
      const gOp = centralGlowOpacity(state)
      gGlow.addColorStop(0, `rgba(${lr},${lg},${lb},${gOp})`)
      gGlow.addColorStop(0.55, `rgba(${lr},${lg},${lb},${gOp * 0.25})`)
      gGlow.addColorStop(1, `rgba(${lr},${lg},${lb},0)`)
      ctx.fillStyle = gGlow
      ctx.fillRect(0, 0, w, h)

      updateAndDrawSaltParticles(ctx, particlesRef.current, tSec, w, h, mox, moy, {
        scrollOx: 0,
        scrollOy,
        staticParticles: reducedMotion,
      })

      const vx = w * 0.5
      const vy = h * 0.5
      const vig = ctx.createRadialGradient(vx, vy, w * VIGNETTE_INNER_FRAC, vx, vy, w * VIGNETTE_OUTER_FRAC)
      vig.addColorStop(0, 'rgba(10,10,8,0)')
      vig.addColorStop(1, 'rgba(10,10,8,0.55)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, w, h)

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      if (debounce) clearTimeout(debounce)
      detach()
    }
  }, [atmosphere, canvasFailed])

  if (!atmosphere) return null
  if (canvasFailed) return <AtmosphereCssFallback />

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 block h-full w-full"
      aria-hidden
    />
  )
}
