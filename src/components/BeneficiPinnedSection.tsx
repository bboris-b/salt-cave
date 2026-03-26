'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap, getScrollTriggerScroller, initGsapPlugins } from '@/lib/gsap-init'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useSmoothScroll } from '@/providers/SmoothScrollContext'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`h-[18px] w-[18px] shrink-0 text-[var(--success)] ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function HookRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <CheckIcon className="mt-0.5" />
      <span className="font-sans text-sm font-medium leading-snug text-[var(--salt-warm)]">{children}</span>
    </div>
  )
}

const STEPS = [
  {
    title: 'Respiri aria purissima',
    body: 'Il sale micronizzato penetra in profondità nelle vie respiratorie, sciogliendo il muco e riducendo l’infiammazione.',
    hooks: (
      <>
        <HookRow>Ideale per asma, sinusite, bronchite, allergie.</HookRow>
        <HookRow>I bambini sotto i 7 anni entrano gratis con un adulto.</HookRow>
      </>
    ),
  },
  {
    title: 'La pelle ringrazia',
    body: 'Il microclima salino ha proprietà antibatteriche e antinfiammatorie naturali.',
    hooks: (
      <HookRow>Psoriasi, eczema, dermatite: molti clienti vedono miglioramenti dal terzo ciclo di sedute.</HookRow>
    ),
  },
  {
    title: 'Lo stress si scioglie',
    body: '45 minuti senza telefono, senza rumore. Gli ioni negativi rilasciati dal sale abbassano il cortisolo e stimolano la serotonina.',
    hooks: (
      <>
        <div className="flex gap-3">
          <CheckIcon className="mt-0.5" />
          <span className="font-display text-sm font-normal leading-snug text-[var(--salt-pink)] [font-variation-settings:'wght'_400,'opsz'_36,'WONK'_0,'SOFT'_0]">
            Da €25 a seduta.
          </span>
        </div>
        <HookRow>Il reset che il tuo corpo chiede.</HookRow>
      </>
    ),
  },
] as const

export function BeneficiPinnedSection() {
  const reduced = usePrefersReducedMotion()
  const smooth = useSmoothScroll()
  const sectionRef = useRef<HTMLElement>(null)
  const pinHostRef = useRef<HTMLDivElement>(null)
  const pinPanelRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  const scrollToPrezzi = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const el = document.querySelector('#prezzi')
    if (!(el instanceof HTMLElement)) return
    if (smooth?.lenis) {
      smooth.lenis.scrollTo(el, { offset: -72, duration: 1.15 })
    } else {
      const top = el.getBoundingClientRect().top + window.scrollY - 72
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  useLayoutEffect(() => {
    initGsapPlugins()
    const section = sectionRef.current
    const host = pinHostRef.current
    const panel = pinPanelRef.current
    const steps = stepRefs.current.filter(Boolean) as HTMLDivElement[]
    if (!section || !host || !panel || steps.length !== 3) return

    const mm = gsap.matchMedia()
    const scroller = getScrollTriggerScroller()

    const setupDesktopPin = () => {
      const s1 = steps[0]
      const s2 = steps[1]
      const s3 = steps[2]
      gsap.set([s1, s2, s3], { autoAlpha: 0, pointerEvents: 'none' })
      gsap.set(s1, { autoAlpha: 1, pointerEvents: 'auto' })

      const endDist = () => Math.max(window.innerHeight * 2.35, 900)

      const tl = gsap.timeline({
        scrollTrigger: {
          scroller,
          trigger: host,
          start: 'top top',
          end: () => `+=${endDist()}`,
          pin: panel,
          scrub: 0.55,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      tl.to(s1, { autoAlpha: 0, duration: 0.06, ease: 'power2.inOut' }, 0.28)
      tl.to(s2, { autoAlpha: 1, pointerEvents: 'auto', duration: 0.08, ease: 'power2.out' }, 0.3)
      tl.to(s2, { autoAlpha: 0, pointerEvents: 'none', duration: 0.06, ease: 'power2.inOut' }, 0.62)
      tl.to(s3, { autoAlpha: 1, pointerEvents: 'auto', duration: 0.08, ease: 'power2.out' }, 0.64)

    }

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(steps, { clearProps: 'all' })
        steps.forEach((s) => gsap.set(s, { autoAlpha: 1, pointerEvents: 'auto' }))
        return
      }

      mm.add('(min-width: 1024px)', () => {
        setupDesktopPin()
      })

      mm.add('(max-width: 1023px)', () => {
        gsap.set(steps, { clearProps: 'all' })
        steps.forEach((s) => gsap.set(s, { autoAlpha: 1, pointerEvents: 'auto' }))
      })
    }, section)

    return () => {
      mm.revert()
      ctx.revert()
    }
  }, [reduced])

  const setStepRef = (i: number) => (el: HTMLDivElement | null) => {
    stepRefs.current[i] = el
  }

  return (
    <section
      ref={sectionRef}
      id="benefici"
      className="scroll-mt-24 border-t border-cave-charcoal/40"
      aria-labelledby="benefici-heading"
    >
      <div className="mx-auto max-w-3xl px-5 pb-8 pt-16 lg:px-8 lg:pb-10 lg:pt-20">
        <h2 id="benefici-heading" className="animate-weight-section type-display-section text-salt-warm">
          Benefici
        </h2>
      </div>

      <div ref={pinHostRef} className="relative lg:min-h-0">
        <div
          ref={pinPanelRef}
          className="flex min-h-[min(100dvh,760px)] items-center justify-center px-5 py-12 lg:min-h-screen lg:px-8"
        >
          <div className="relative mx-auto w-full max-w-xl">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                ref={setStepRef(i)}
                className={`mb-10 last:mb-0 lg:mb-0 lg:absolute lg:inset-0 lg:flex lg:items-center lg:justify-center ${i > 0 ? 'lg:opacity-0' : ''}`}
              >
                <div className="w-full max-w-xl border border-cave-charcoal/60 bg-cave-dark/40 p-8 backdrop-blur-sm md:p-10 lg:border-cave-charcoal/50">
                  <h3 className="font-display text-[clamp(1.35rem,3vw,1.85rem)] font-medium leading-tight text-[var(--salt-warm)] [font-variation-settings:'wght'_500,'opsz'_48,'WONK'_0,'SOFT'_0]">
                    {step.title}
                  </h3>
                  <p className="mt-5 font-sans text-base font-normal leading-relaxed text-[var(--text-primary)]">
                    {step.body}
                  </p>
                  <div className="mt-6 space-y-3 border-t border-cave-charcoal/40 pt-6">{step.hooks}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 pb-20 pt-6 lg:px-8 lg:pb-24 lg:pt-10">
        <ScrollReveal className="flex flex-col items-center text-center" distance={24} duration={700} stagger={100}>
          <p className="font-display text-xl font-normal text-[var(--salt-warm)] [font-variation-settings:'wght'_400,'opsz'_40,'WONK'_0,'SOFT'_0]">
            Hai trovato il tuo motivo?
          </p>
          <a
            href="#prezzi"
            onClick={scrollToPrezzi}
            className="cta-focus-visible mt-6 inline-flex items-center justify-center rounded-[100px] border border-[var(--accent-cta)] bg-transparent px-8 py-3 font-sans text-sm font-medium text-[var(--accent-cta)] transition-colors duration-300 hover:bg-[var(--accent-cta)] hover:text-cave-black"
          >
            Scopri i pacchetti
          </a>
        </ScrollReveal>
      </div>
    </section>
  )
}
