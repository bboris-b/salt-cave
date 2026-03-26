'use client'

import { useLayoutEffect, useRef } from 'react'
import SplitType from 'split-type'
import { gsap, getScrollTriggerScroller, initGsapPlugins } from '@/lib/gsap-init'
import { HERO_DATA_LINE, HERO_HALO_LINE, HERO_NARRATIVE } from '@/lib/heroExperienceCopy'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Narrativa sensoriale + riga d’impatto (ex blocco sotto il visual hero).
 * Animazioni scroll allineate al vecchio ScienceHero viewport 3.
 */
export function ExperienceStoryBlock() {
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const narrativeRef = useRef<HTMLParagraphElement>(null)
  const dataRef = useRef<HTMLParagraphElement>(null)
  const haloRef = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const narrativeEl = narrativeRef.current
    const dataEl = dataRef.current
    const haloEl = haloRef.current
    if (!root || !narrativeEl || !dataEl || !haloEl) return

    initGsapPlugins()
    let splitNarrative: SplitType | null = null

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([narrativeEl, dataEl, haloEl], { clearProps: 'all', autoAlpha: 1 })
        return
      }

      const scroller = getScrollTriggerScroller()
      gsap.set([narrativeEl, dataEl, haloEl], { autoAlpha: 0 })
      gsap.set(dataEl, { x: -20 })

      splitNarrative = new SplitType(narrativeEl, { types: 'lines', tagName: 'span' })
      const lines = splitNarrative.lines
      if (lines?.length) {
        gsap.from(lines, {
          y: 40,
          autoAlpha: 0,
          duration: 0.85,
          stagger: 0.08,
          ease: 'power4.out',
          scrollTrigger: {
            scroller,
            trigger: narrativeEl,
            start: 'top 78%',
            once: true,
          },
        })
      } else {
        gsap.set(narrativeEl, { autoAlpha: 1 })
      }

      const tailTl = gsap.timeline({
        scrollTrigger: {
          scroller,
          trigger: dataEl,
          start: 'top 82%',
          once: true,
        },
      })
      tailTl.fromTo(dataEl, { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.8, ease: 'power3.out' })
      tailTl.fromTo(haloEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.65, ease: 'power2.out' }, '-=0.35')
    }, root)

    return () => {
      ctx.revert()
      splitNarrative?.revert()
    }
  }, [reduced])

  return (
    <div ref={rootRef} className="border-t border-cave-charcoal/30 pt-8 md:pt-10 lg:pt-12">
      <p
        ref={narrativeRef}
        className="science-hero-narrative max-w-2xl font-sans font-normal leading-[1.8] text-[var(--text-primary)] [font-size:clamp(1rem,1.1vw,1.125rem)]"
      >
        {HERO_NARRATIVE}
      </p>

      <p ref={dataRef} className="type-hero-data mt-8 max-w-2xl md:mt-10">
        {HERO_DATA_LINE}
      </p>

      <p
        ref={haloRef}
        className="mt-5 max-w-2xl font-sans text-base font-normal leading-relaxed text-[var(--text-secondary)] md:mt-6"
      >
        {HERO_HALO_LINE}
      </p>
    </div>
  )
}
