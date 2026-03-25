'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  SALT_LOADER_DRAW_MS,
  SALT_LOADER_FADE_MS,
  SALT_LOADER_ORGANIC_PATH,
  SALT_LOADER_STORAGE_KEY,
} from '@/lib/salt-loader-config'

const PHASE2_MS = 300
/** Ritardo prima di considerare il bundle “pronto” così la % non salta subito a 100. */
const APP_READY_DELAY_MS = 48

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

type ActiveProps = { onFinish: () => void }

function SaltLoaderActive({ onFinish }: ActiveProps) {
  const t0Ref = useRef(0)
  const appReadyRef = useRef(false)
  const hideScheduledRef = useRef(false)
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null)
  const [pct, setPct] = useState(0)
  const [exiting, setExiting] = useState(false)

  useLayoutEffect(() => {
    t0Ref.current = performance.now()
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => {
      appReadyRef.current = true
    }, APP_READY_DELAY_MS)
    return () => clearTimeout(t)
  }, [])

  const scheduleHide = useCallback(() => {
    if (hideScheduledRef.current) return
    hideScheduledRef.current = true
    const elapsed = performance.now() - t0Ref.current
    const remaining = Math.max(0, SALT_LOADER_DRAW_MS - elapsed)
    window.setTimeout(() => {
      setExiting(true)
      window.setTimeout(onFinish, SALT_LOADER_FADE_MS)
    }, remaining)
  }, [onFinish])

  useEffect(() => {
    if (reducedMotion !== true) return
    scheduleHide()
    return undefined
  }, [reducedMotion, scheduleHide])

  useEffect(() => {
    if (reducedMotion !== false) return

    let raf = 0
    const tick = () => {
      const elapsed = performance.now() - t0Ref.current
      let currentPct: number
      if (!appReadyRef.current) {
        if (elapsed < SALT_LOADER_DRAW_MS) {
          const t = elapsed / SALT_LOADER_DRAW_MS
          currentPct = Math.round(easeInOutQuad(t) * 85)
        } else {
          const extra = Math.floor((elapsed - SALT_LOADER_DRAW_MS) / PHASE2_MS)
          currentPct = Math.min(99, 85 + extra)
        }
      } else {
        currentPct = 100
      }

      setPct(currentPct)
      if (currentPct < 100) {
        raf = requestAnimationFrame(tick)
      } else {
        scheduleHide()
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reducedMotion, scheduleHide])

  const pctLabel = reducedMotion === true ? 'Caricamento…' : `${pct}%`

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center bg-cave-black transition-opacity duration-[600ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] ${
        exiting ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      aria-busy={!exiting}
      aria-label="Caricamento"
    >
      <div className="flex flex-col items-center px-6">
        <svg
          className="h-[112px] w-[112px] sm:h-[124px] sm:w-[124px]"
          viewBox="0 0 100 100"
          role="progressbar"
          aria-valuenow={reducedMotion === true ? undefined : pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={reducedMotion === true ? 'Caricamento in corso' : undefined}
          aria-label={"Caricamento dell'esperienza"}
        >
          <path pathLength={100} d={SALT_LOADER_ORGANIC_PATH} className="salt-loader-path" />
        </svg>
        <p
          role="status"
          aria-live="polite"
          className="mt-8 font-sans text-[15px] font-medium tabular-nums tracking-wide text-salt-pink/90 sm:text-[17px]"
        >
          {pctLabel}
        </p>
      </div>
    </div>
  )
}

/**
 * Loader solo alla prima entrata nel sito (per tab): `sessionStorage` evita ripresentazioni
 * dopo navigazioni client; non dipende da `remove()` sul DOM (evita conflitti con React).
 */
export function SaltLoaderGate() {
  const [hydrated, setHydrated] = useState(false)
  const [active, setActive] = useState(false)

  useEffect(() => {
    setHydrated(true)
    try {
      if (sessionStorage.getItem(SALT_LOADER_STORAGE_KEY) !== '1') {
        setActive(true)
      }
    } catch {
      setActive(true)
    }
  }, [])

  const onFinish = useCallback(() => {
    try {
      sessionStorage.setItem(SALT_LOADER_STORAGE_KEY, '1')
    } catch {
      /* storage disabilitato */
    }
    setActive(false)
  }, [])

  if (!hydrated) return null
  if (!active) return null
  return <SaltLoaderActive onFinish={onFinish} />
}
