'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { gsap, getScrollTriggerScroller, initGsapPlugins } from '@/lib/gsap-init'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

type Direction = 'up' | 'left' | 'right'

type Props = {
  children: ReactNode
  direction?: Direction
  distance?: number
  duration?: number
  delay?: number
  stagger?: number
  className?: string
}

export function ScrollReveal({
  children,
  direction = 'up',
  distance = 28,
  duration = 750,
  delay = 0,
  stagger = 80,
  className = '',
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    initGsapPlugins()
    const el = rootRef.current
    if (!el) return

    if (reduced) {
      gsap.set(el, { clearProps: 'all' })
      Array.from(el.children).forEach((c) => gsap.set(c as HTMLElement, { clearProps: 'all' }))
      return
    }

    const scroller = getScrollTriggerScroller()

    const ctx = gsap.context(() => {
      const childEls = Array.from(el.children) as HTMLElement[]
      const targets = childEls.length > 0 ? childEls : [el]

      targets.forEach((target, i) => {
        const from: Record<string, number> = { autoAlpha: 0 }
        if (direction === 'up') from.y = distance
        else if (direction === 'left') from.x = distance
        else from.x = -distance

        gsap.from(target, {
          ...from,
          ease: 'power2.out',
          duration: duration / 1000,
          delay: (delay + i * stagger) / 1000,
          scrollTrigger: {
            scroller,
            trigger: el,
            start: 'top 80%',
            once: true,
          },
        })
      })
    }, el)

    return () => ctx.revert()
  }, [reduced, direction, distance, duration, delay, stagger])

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  )
}
