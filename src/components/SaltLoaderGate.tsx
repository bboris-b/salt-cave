'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, initGsapPlugins } from '@/lib/gsap-init'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const SALT_LOADER_STORAGE_KEY = 'salt-cave-loader-done'
const READY_MAX_MS = 1500
const HARD_MAX_MS = 2000
const LOGO_FADE_MS = 0.55
const EXIT_LOGO_MS = 0.45
const EXIT_SLIDE_MS = 0.55

type ActiveProps = { onFinish: () => void }

function SaltLoaderActive({ onFinish }: ActiveProps) {
  const reduced = usePrefersReducedMotion()
  const overlayRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLParagraphElement>(null)
  const finishedRef = useRef(false)

  const finishOnce = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    onFinish()
  }, [onFinish])

  useLayoutEffect(() => {
    if (reduced) {
      finishOnce()
      return
    }

    initGsapPlugins()
    const overlay = overlayRef.current
    const logo = logoRef.current
    if (!overlay || !logo) return

    const hardTimer = window.setTimeout(() => {
      finishOnce()
    }, HARD_MAX_MS)

    const run = async () => {
      gsap.fromTo(logo, { autoAlpha: 0 }, { autoAlpha: 1, duration: LOGO_FADE_MS, ease: 'power2.out' })

      await Promise.race([
        document.fonts.ready.catch(() => undefined),
        new Promise<void>((r) => window.setTimeout(r, READY_MAX_MS)),
      ])

      if (finishedRef.current) return

      gsap.set(logo, { scale: 1.02 })
      const tl = gsap.timeline({
        onComplete: () => {
          window.clearTimeout(hardTimer)
          finishOnce()
        },
      })
      tl.to(logo, { scale: 1, duration: EXIT_LOGO_MS, ease: 'power2.out' }, 0)
      tl.to(overlay, { yPercent: -100, duration: EXIT_SLIDE_MS, ease: 'power3.inOut' }, 0.12)
      tl.set(overlay, { clearProps: 'willChange' })
    }

    void run()

    return () => {
      window.clearTimeout(hardTimer)
    }
  }, [reduced, finishOnce])

  if (reduced) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-cave-black will-change-transform"
      aria-busy="true"
      aria-label="Caricamento"
    >
      <p
        ref={logoRef}
        className="type-label-uppercase px-6 text-center text-salt-warm"
        style={{ opacity: 0 }}
      >
        GROTTA DI SALE
      </p>
    </div>
  )
}

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
      /* ignore */
    }
    setActive(false)
  }, [])

  if (!hydrated) return null
  if (!active) return null
  return <SaltLoaderActive onFinish={onFinish} />
}
