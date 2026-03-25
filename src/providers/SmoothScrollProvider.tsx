'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { initGsapPlugins, gsap, ScrollTrigger } from '@/lib/gsap-init'
import { SmoothScrollContext, type SmoothScrollContextValue } from '@/providers/SmoothScrollContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export const REDUCED_MOTION_CLASS = 'salt-cave-reduced-motion'

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion()
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const [metrics, setMetrics] = useState({ scroll: 0, limit: 0, progress: 0 })

  useEffect(() => {
    initGsapPlugins()
    if (reducedMotion) {
      document.documentElement.classList.add(REDUCED_MOTION_CLASS)
      gsap.defaults({ duration: 0, overwrite: 'auto' })
    } else {
      document.documentElement.classList.remove(REDUCED_MOTION_CLASS)
      gsap.defaults({ overwrite: 'auto' })
    }
  }, [reducedMotion])

  useEffect(() => {
    initGsapPlugins()

    if (reducedMotion) {
      setLenis(null)
      const onNativeScroll = () => {
        const limit = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
        const scroll = window.scrollY
        setMetrics({
          scroll,
          limit,
          progress: limit > 0 ? scroll / limit : 0,
        })
        ScrollTrigger.update()
      }
      window.addEventListener('scroll', onNativeScroll, { passive: true })
      onNativeScroll()
      return () => window.removeEventListener('scroll', onNativeScroll)
    }

    const expoOut = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))

    const instance = new Lenis({
      duration: 1.2,
      easing: expoOut,
      smoothWheel: true,
      syncTouch: false,
      autoResize: true,
    })
    setLenis(instance)

    const onLenisScroll = (l: Lenis) => {
      setMetrics({
        scroll: l.scroll,
        limit: l.limit,
        progress: l.progress,
      })
      ScrollTrigger.update()
    }

    instance.on('scroll', onLenisScroll)
    onLenisScroll(instance)

    const scroller = document.documentElement
    ScrollTrigger.scrollerProxy(scroller, {
      scrollTop(value) {
        if (arguments.length && typeof value === 'number') {
          instance.scrollTo(value, { immediate: true })
        }
        return instance.scroll
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
      },
    })

    const onTicker = (time: number) => {
      instance.raf(time * 1000)
    }
    gsap.ticker.add(onTicker)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(onTicker)
      ScrollTrigger.scrollerProxy(scroller, {})
      instance.destroy()
      setLenis(null)
      ScrollTrigger.refresh()
    }
  }, [reducedMotion])

  const value = useMemo<SmoothScrollContextValue>(
    () => ({
      lenis,
      scroll: metrics.scroll,
      limit: metrics.limit,
      progress: metrics.progress,
      reducedMotion,
    }),
    [lenis, metrics.limit, metrics.progress, metrics.scroll, reducedMotion],
  )

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>
}
