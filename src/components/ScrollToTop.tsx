'use client'

import { useEffect, useState } from 'react'
import { useSmoothScroll } from '@/providers/SmoothScrollContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/** power4.out ~ (1 - (1-t)^4) */
function easePower4Out(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

export function ScrollToTop() {
  const smooth = useSmoothScroll()
  const reduced = usePrefersReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const vh = () => window.innerHeight
    const check = () => {
      const y = smooth?.lenis?.scroll ?? window.scrollY
      setVisible(y >= vh() * 2)
    }
    check()
    const lenis = smooth?.lenis
    const offLenis = lenis?.on('scroll', check)
    window.addEventListener('resize', check, { passive: true })
    if (!lenis) window.addEventListener('scroll', check, { passive: true })
    return () => {
      offLenis?.()
      window.removeEventListener('resize', check)
      if (!lenis) window.removeEventListener('scroll', check)
    }
  }, [smooth?.lenis])

  const onClick = () => {
    const lenis = smooth?.lenis
    if (lenis && !smooth?.reducedMotion) {
      lenis.scrollTo(0, {
        duration: 2,
        easing: easePower4Out,
      })
      return
    }
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Torna in cima"
      className="fixed bottom-8 right-6 z-[85] hidden h-12 w-12 items-center justify-center rounded-full border border-cave-charcoal bg-cave-dark/80 text-text-muted shadow-lg backdrop-blur-sm transition-[background-color,color,transform] duration-200 hover:scale-[1.03] hover:bg-salt-pink hover:text-cave-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salt-pink focus-visible:ring-offset-2 focus-visible:ring-offset-cave-black lg:flex"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
