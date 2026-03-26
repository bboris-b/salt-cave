'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { gsap, initGsapPlugins } from '@/lib/gsap-init'
import { routes } from '@/lib/routes'
import { useSmoothScroll } from '@/providers/SmoothScrollContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
export function StickyCtaMobile() {
  const smooth = useSmoothScroll()
  const reduced = usePrefersReducedMotion()
  const barRef = useRef<HTMLDivElement>(null)
  const [vh, setVh] = useState(600)
  const [visible, setVisible] = useState(false)
  const scroll = smooth?.scroll ?? 0

  useLayoutEffect(() => {
    const el = barRef.current
    if (!el) return
    initGsapPlugins()
    gsap.set(el, { yPercent: 100 })
  }, [])

  useEffect(() => {
    const read = () => setVh(window.innerHeight)
    read()
    window.addEventListener('resize', read)
    return () => window.removeEventListener('resize', read)
  }, [])

  useEffect(() => {
    setVisible(scroll > vh)
  }, [scroll, vh])

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    initGsapPlugins()
    if (reduced) {
      gsap.set(el, { yPercent: visible ? 0 : 100 })
      return
    }
    gsap.to(el, {
      yPercent: visible ? 0 : 100,
      duration: 0.45,
      ease: 'power2.out',
    })
  }, [visible, reduced])

  return (
    <div
      ref={barRef}
      className="fixed bottom-0 left-0 right-0 z-[90] flex items-center justify-between gap-4 border-t border-cave-charcoal bg-cave-dark/95 px-4 py-3 backdrop-blur-[20px] lg:hidden"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <p className="min-w-0 flex-1 font-sans text-sm font-normal text-text-primary">Prenota la tua seduta</p>
      <Link
        href={routes.prenota}
        className="cta-focus-visible shrink-0 rounded-[100px] bg-[var(--accent-cta)] px-5 py-2 font-sans text-xs font-medium text-cave-black transition-colors duration-300 hover:bg-[var(--accent-cta-hover)]"
      >
        Prenota
      </Link>
    </div>
  )
}
