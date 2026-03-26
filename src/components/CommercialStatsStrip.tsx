'use client'

import { useLayoutEffect, useRef } from 'react'
import { gsap, getScrollTriggerScroller, initGsapPlugins } from '@/lib/gsap-init'
import { SITE_GRID_WRAP } from '@/lib/page-layout'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const valueClass =
  'font-display text-[clamp(1.05rem,2.6vw,1.35rem)] font-normal leading-snug text-[var(--salt-pink)] [font-variation-settings:"wght"_300,"opsz"_48,"WONK"_0,"SOFT"_0]'

const descClass = 'mt-3 font-sans text-sm font-normal leading-relaxed text-[var(--text-secondary)]'

export function CommercialStatsStrip() {
  const reduced = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const col1Ref = useRef<HTMLDivElement>(null)
  const col2Ref = useRef<HTMLDivElement>(null)
  const col3Ref = useRef<HTMLDivElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    initGsapPlugins()
    const section = sectionRef.current
    const c1 = col1Ref.current
    const c2 = col2Ref.current
    const c3 = col3Ref.current
    const pctEl = pctRef.current
    if (!section || !c1 || !c2 || !c3 || !pctEl) return

    const scroller = getScrollTriggerScroller()

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([c1, c2, c3], { clearProps: 'all' })
        gsap.set([c1, c2, c3], { autoAlpha: 1, y: 0 })
        pctEl.textContent = '93'
        return
      }

      gsap.set([c1, c2, c3], { autoAlpha: 0, y: 28 })
      pctEl.textContent = '0'

      const counter = { n: 0 }
      const tl = gsap.timeline({
        scrollTrigger: {
          scroller,
          trigger: section,
          start: 'top 78%',
          once: true,
        },
      })

      tl.to(c1, { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power3.out' }, 0)
      tl.to(c2, { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power3.out' }, 0.12)
      tl.to(c3, { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power3.out' }, 0.24)
      tl.to(
        counter,
        {
          n: 93,
          duration: 1.85,
          ease: 'power2.out',
          onUpdate: () => {
            pctEl.textContent = String(Math.round(counter.n))
          },
        },
        0,
      )
    }, section)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section
      ref={sectionRef}
      className="border-t border-cave-charcoal/40 bg-transparent"
      aria-label="In sintesi"
    >
      <div className={`${SITE_GRID_WRAP} py-16 md:py-20`}>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8 lg:gap-10">
          <div ref={col1Ref} className="text-center md:text-left">
            <p className={valueClass}>Una seduta, quanto una pausa pranzo</p>
          </div>

          <div ref={col2Ref} className="text-center md:text-left">
            <p className={`${valueClass} text-[clamp(2rem,5vw,2.75rem)] leading-none tracking-tight`}>
              <span ref={pctRef}>0</span>%
            </p>
            <p className={descClass}>dei clienti prenota un secondo ciclo</p>
          </div>

          <div ref={col3Ref} className="text-center md:text-left">
            <p className={valueClass}>gratis. Porta i tuoi bambini</p>
          </div>
        </div>
      </div>
    </section>
  )
}
