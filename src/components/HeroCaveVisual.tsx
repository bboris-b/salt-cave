'use client'

import { useLayoutEffect, useRef } from 'react'
import { createSaltParticles, updateAndDrawSaltParticles } from '@/lib/atmosphereParticles'
import { useSmoothScroll } from '@/providers/SmoothScrollContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const MAX_DPR = 2
const PARTICLE_COUNT = 108
const SCROLL_PARALLAX = 0.15

type Props = {
  className?: string
}

/**
 * Particelle sale (stessa logica di AtmosphericBackground), densità e luminosità
 * leggermente maggiori per il riquadro hero.
 */
export function HeroCaveParticles({ className = '' }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<ReturnType<typeof createSaltParticles>>([])
  const mouseRef = useRef({ x: 0.5, y: 0.5, sx: 0.5, sy: 0.5 })
  const smooth = useSmoothScroll()
  const reduced = usePrefersReducedMotion()
  const smoothRef = useRef(smooth)
  smoothRef.current = smooth

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const size = { w: 0, h: 0, dpr: 1 }

    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const r = wrap.getBoundingClientRect()
      const w = Math.max(1, Math.floor(r.width))
      const h = Math.max(1, Math.floor(r.height))
      size.w = w
      size.h = h
      size.dpr = dpr
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const parts = createSaltParticles(PARTICLE_COUNT, w, h, 0.51)
      for (const p of parts) {
        p.alpha = Math.min(0.12, p.alpha * 1.85)
        p.size *= 1.2
      }
      particlesRef.current = parts
    }

    measure()
    const ro = new ResizeObserver(() => measure())
    ro.observe(wrap)

    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect()
      mouseRef.current.x = (e.clientX - r.left) / Math.max(1, r.width)
      mouseRef.current.y = (e.clientY - r.top) / Math.max(1, r.height)
    }
    canvas.addEventListener('mousemove', onMove, { passive: true })

    let raf = 0
    const loop = (ts: number) => {
      const tSec = ts / 1000
      const { w, h, dpr } = size
      if (w < 2 || h < 2) {
        raf = requestAnimationFrame(loop)
        return
      }

      const m = mouseRef.current
      m.sx += (m.x - m.sx) * 0.06
      m.sy += (m.y - m.sy) * 0.06
      const ox = m.sx - 0.5
      const oy = m.sy - 0.5

      const scroll = smoothRef.current?.scroll ?? 0
      const scrollOy = -scroll * SCROLL_PARALLAX * 0.4

      ctx.clearRect(0, 0, w, h)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      updateAndDrawSaltParticles(ctx, particlesRef.current, tSec, w, h, ox * 1.2, oy * 1.2, {
        scrollOx: scroll * SCROLL_PARALLAX * 0.08,
        scrollOy,
        staticParticles: reduced,
      })

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('mousemove', onMove)
    }
  }, [reduced])

  return (
    <div ref={wrapRef} className={`absolute inset-0 z-[2] ${className}`.trim()} aria-hidden>
      <canvas ref={canvasRef} className="block h-full w-full touch-none" />
    </div>
  )
}
