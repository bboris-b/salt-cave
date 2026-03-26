'use client'

import { useLayoutEffect } from 'react'
import { gsap, getScrollTriggerScroller, initGsapPlugins } from '@/lib/gsap-init'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Titoli con classe .animate-weight (opsz 144) o .animate-weight-section (opsz 72):
 * wght 300 → 500 allo scroll (scrub).
 */
export function AnimateWeightTitles() {
  const reduced = usePrefersReducedMotion()

  useLayoutEffect(() => {
    if (reduced) return

    initGsapPlugins()

    const scroller = getScrollTriggerScroller()

    const ctx = gsap.context(() => {
      const heroTitles = gsap.utils
        .toArray<HTMLElement>('.animate-weight')
        .filter((el) => !el.classList.contains('animate-weight-section'))
      const sectionTitles = gsap.utils.toArray<HTMLElement>('.animate-weight-section')

      const setFvsWillChange = (el: HTMLElement, on: boolean) => {
        el.style.willChange = on ? 'font-variation-settings' : ''
      }

      const run = (el: HTMLElement, opsz: number) => {
        gsap.fromTo(
          el,
          { fontVariationSettings: `"wght" 300, "opsz" ${opsz}, "WONK" 0, "SOFT" 0` },
          {
            fontVariationSettings: `"wght" 500, "opsz" ${opsz}, "WONK" 0, "SOFT" 0`,
            ease: 'none',
            scrollTrigger: {
              scroller,
              trigger: el,
              start: 'top 80%',
              end: 'top 20%',
              scrub: true,
              onEnter: () => setFvsWillChange(el, true),
              onEnterBack: () => setFvsWillChange(el, true),
              onLeave: () => setFvsWillChange(el, false),
              onLeaveBack: () => setFvsWillChange(el, false),
            },
          },
        )
      }

      heroTitles.forEach((el) => run(el, 144))
      sectionTitles.forEach((el) => run(el, 72))
    })

    return () => {
      ctx.revert()
      gsap.utils.toArray<HTMLElement>('.animate-weight, .animate-weight-section').forEach((el) => {
        el.style.willChange = ''
      })
    }
  }, [reduced])

  return null
}
