'use client'

import { useLayoutEffect, useRef } from 'react'
import SplitType from 'split-type'
import Link from 'next/link'
import { gsap, initGsapPlugins } from '@/lib/gsap-init'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const TITLE = 'Chi ci ha scelto'
const WORD_STAGGER = 0.1
const WORD_DURATION = 0.8
const LINE_STAGGER = 0.08
const LINE_DURATION = 0.8

const TESTIMONIALS = [
  {
    tag: 'Asma infantile',
    quote:
      'Da quando portiamo Matteo alla grotta, le crisi notturne si sono dimezzate. Dorme finalmente tranquillo, e noi con lui.',
    name: 'Laura M., mamma di Matteo (5 anni)',
    detail: 'Ciclo di 10 sedute, 3 mesi fa',
  },
  {
    tag: 'Stress cronico',
    quote:
      'Il lavoro mi lasciava la gola chiusa e le spalle tese. Qui ho imparato a respirare di nuovo in profondità, senza fretta.',
    name: 'Andrea P., 42 anni',
    detail: 'Percorso bisettimanale, in corso',
  },
  {
    tag: 'Dermatite',
    quote:
      'La pelle meno arrossata dopo qualche seduta non era quello che mi aspettavo. È stato un sollievo anche solo potermi grattare meno.',
    name: 'Giulia R., 29 anni',
    detail: 'Ciclo di 8 sedute, 6 mesi fa',
  },
  {
    tag: 'Allergie stagionali',
    quote:
      'A primavera stavo sempre con il fazzoletto. Ora affronto la stagione con meno paura: il naso si libera e il respiro è più leggero.',
    name: 'Marco T., 51 anni',
    detail: 'Ciclo annuale, da 2 stagioni',
  },
] as const

export function TestimonialSection() {
  const reduced = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const sub1Ref = useRef<HTMLSpanElement>(null)
  const sub2Ref = useRef<HTMLSpanElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const progressInnerRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)
  const calloutRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)
  const parallaxWrapRefs = useRef<(HTMLDivElement | null)[]>([])
  const cardRefs = useRef<(HTMLElement | null)[]>([])

  useLayoutEffect(() => {
    initGsapPlugins()
    const section = sectionRef.current
    const titleEl = titleRef.current
    const s1 = sub1Ref.current
    const s2 = sub2Ref.current
    const pin = pinRef.current
    const track = trackRef.current
    const progressInner = progressInnerRef.current
    const hint = hintRef.current
    const callout = calloutRef.current
    const cta = ctaRef.current

    if (!section || !titleEl || !s1 || !s2) return

    let split: SplitType | null = null
    let introOk = !reduced
    const cards = () => cardRefs.current.filter(Boolean) as HTMLElement[]

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([titleEl, s1, s2], { clearProps: 'all' })
        gsap.set(titleEl, { autoAlpha: 1 })
        gsap.set([s1, s2], { yPercent: 0 })
        cards().forEach((c) => gsap.set(c, { clearProps: 'all', autoAlpha: 1, scale: 1 }))
        parallaxWrapRefs.current.forEach((w) => {
          if (w) gsap.set(w, { clearProps: 'transform' })
        })
        if (progressInner) gsap.set(progressInner, { scaleX: 1 })
        if (hint) gsap.set(hint, { autoAlpha: 0 })
        if (cta) gsap.set(cta, { clearProps: 'all', autoAlpha: 1, y: 0 })
        return
      }

      split = new SplitType(titleEl, { types: 'words', tagName: 'span' })
      const words = split.words
      if (!words?.length) {
        split.revert()
        split = null
        introOk = false
        return
      }

      const n = words.length
      const titleAnimSpan = (n - 1) * WORD_STAGGER + WORD_DURATION
      const subtitleStart = 0.55 + titleAnimSpan + 0.2

      gsap.set(words, { autoAlpha: 0, y: 56 })
      gsap.set([s1, s2], { yPercent: 100 })

      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          once: true,
        },
      })
        .fromTo(
          words,
          { autoAlpha: 0, y: 56 },
          {
            autoAlpha: 1,
            y: 0,
            duration: WORD_DURATION,
            stagger: WORD_STAGGER,
            ease: 'power3.out',
          },
          0,
        )
        .fromTo(
          s1,
          { yPercent: 100 },
          { yPercent: 0, duration: LINE_DURATION, ease: 'power4.out' },
          subtitleStart,
        )
        .fromTo(
          s2,
          { yPercent: 100 },
          { yPercent: 0, duration: LINE_DURATION, ease: 'power4.out' },
          subtitleStart + LINE_STAGGER,
        )

      if (callout && cta) {
        gsap.set(cta, { autoAlpha: 0, y: 20 })
        gsap.to(cta, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: callout,
            start: 'top 82%',
            once: true,
          },
        })
      }
    }, section)

    const mm = gsap.matchMedia()

    if (introOk && pin && track && progressInner && hint) {
      mm.add('(min-width: 1024px)', () => {
        const scrollDistance = () => Math.max(0, track.scrollWidth - pin.clientWidth)

        gsap.set(progressInner, { scaleX: 0, transformOrigin: 'left center' })
        gsap.set(hint, { autoAlpha: 1 })
        gsap.set(cards(), { autoAlpha: 0, scale: 0.95 })

        const scrollTriggerConfig: gsap.plugins.ScrollTriggerInstanceVars = {
          trigger: pin,
          start: 'top top',
          end: () => `+=${scrollDistance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress
            gsap.set(progressInner, { scaleX: p })
            if (p > 0.03) gsap.to(hint, { autoAlpha: 0, duration: 0.35, ease: 'power2.out' })
            parallaxWrapRefs.current.forEach((wrap, i) => {
              if (!wrap) return
              const dir = i % 2 === 0 ? -1 : 1
              const amp = i % 2 === 0 ? 14 : 12
              gsap.set(wrap, { y: dir * p * amp })
            })
          },
        }

        if (TESTIMONIALS.length > 1) {
          scrollTriggerConfig.snap = {
            snapTo: (value: number) =>
              Math.round(value * (TESTIMONIALS.length - 1)) / (TESTIMONIALS.length - 1),
            duration: { min: 0.15, max: 0.4 },
            delay: 0.05,
            ease: 'power2.inOut',
          }
        }

        const horizontalTween = gsap.to(track, {
          x: () => -scrollDistance(),
          ease: 'none',
          scrollTrigger: scrollTriggerConfig,
        })

        cards().forEach((card) => {
          gsap.fromTo(
            card,
            { autoAlpha: 0, scale: 0.95 },
            {
              autoAlpha: 1,
              scale: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                containerAnimation: horizontalTween,
                start: 'left 90%',
                end: 'left 52%',
                scrub: 0.25,
              },
            },
          )
        })

        return () => {
          horizontalTween.scrollTrigger?.kill()
          horizontalTween.kill()
        }
      })

      mm.add('(max-width: 1023px)', () => {
        gsap.set(cards(), { autoAlpha: 0, scale: 0.95 })
        gsap.fromTo(
          cards(),
          { autoAlpha: 0, scale: 0.95 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.55,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: track,
              start: 'top 78%',
              once: true,
            },
          },
        )
        return () => {}
      })
    }

    return () => {
      mm.revert()
      ctx.revert()
      split?.revert()
    }
  }, [reduced])

  const setParallaxRef = (i: number) => (el: HTMLDivElement | null) => {
    parallaxWrapRefs.current[i] = el
  }

  const setCardRef = (i: number) => (el: HTMLElement | null) => {
    cardRefs.current[i] = el
  }

  const cardInner = (i: number) => (
    <>
      <span className="inline-flex rounded-full bg-cave-charcoal px-3 py-1 font-sans text-xs font-normal text-salt-pink">
        {TESTIMONIALS[i].tag}
      </span>
      <blockquote className="relative mt-6 flex-1">
        <span
          className="type-display-deco pointer-events-none absolute -left-1 -top-3 text-[4.5rem] leading-none text-salt-pink/[0.2] md:text-[5rem]"
          aria-hidden
        >
          &ldquo;
        </span>
        <p className="type-display-lead relative z-[1] italic leading-relaxed text-text-primary">
          {TESTIMONIALS[i].quote}
        </p>
      </blockquote>
      <footer className="mt-6 border-t border-cave-charcoal/50 pt-5">
        <p className="font-sans text-sm font-medium text-salt-warm">{TESTIMONIALS[i].name}</p>
        <p className="mt-1 font-sans text-xs font-normal text-text-muted">{TESTIMONIALS[i].detail}</p>
      </footer>
    </>
  )

  return (
    <section
      ref={sectionRef}
      id="testimonianze"
      className="scroll-mt-24 border-t border-cave-charcoal/40"
      aria-labelledby="testimonial-title"
    >
      <div className="mx-auto max-w-6xl px-5 pb-8 pt-20 lg:px-8 lg:pb-10 lg:pt-24">
        <h2
          id="testimonial-title"
          ref={titleRef}
          className="animate-weight-section type-display-section max-w-[20ch] text-salt-warm md:max-w-none"
        >
          {TITLE}
        </h2>
        <div className="mt-6 max-w-xl space-y-0">
          <div className="overflow-hidden">
            <span
              ref={sub1Ref}
              className="block font-sans text-base font-normal leading-snug text-text-secondary md:text-[15px] md:leading-relaxed"
            >
              Storie vere di chi ha trovato sollievo
            </span>
          </div>
          <div className="overflow-hidden">
            <span
              ref={sub2Ref}
              className="block font-sans text-base font-normal leading-snug text-text-secondary md:text-[15px] md:leading-relaxed"
            >
              nella grotta
            </span>
          </div>
        </div>
      </div>

      <div
        ref={pinRef}
        className="relative overflow-visible lg:min-h-[min(85vh,720px)] lg:overflow-hidden"
        role="region"
        aria-label="Testimonianze dei clienti. Su schermi grandi, scorri ancora in verticale per far scorrere le storie in orizzontale."
      >
        <p
          ref={hintRef}
          className="pointer-events-none absolute left-1/2 top-4 z-10 hidden -translate-x-1/2 font-sans text-xs font-normal text-text-muted lg:block"
          aria-hidden
        >
          Scorri →
        </p>

        <div className="flex items-center lg:h-full lg:min-h-[min(85vh,720px)]">
          <div
            ref={trackRef}
            role="list"
            aria-label="Testimonianze"
            className="mx-auto flex w-full max-w-[420px] flex-col gap-8 px-5 pb-12 will-change-transform lg:mx-0 lg:max-w-none lg:w-max lg:flex-row lg:flex-nowrap lg:items-center lg:gap-8 lg:pl-8 lg:pr-[min(8vw,4rem)] lg:pb-24"
          >
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.tag}
                ref={setParallaxRef(i)}
                className="shrink-0 lg:will-change-transform"
                data-parallax-wrap
              >
                <article
                  ref={setCardRef(i)}
                  tabIndex={0}
                  role="listitem"
                  className="testimonial-card flex min-h-0 min-w-0 flex-col rounded-2xl border border-cave-charcoal bg-cave-dark p-10 shadow-none outline-none transition-[transform,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)] lg:min-w-[360px] lg:max-w-[420px] lg:hover:-translate-y-1 lg:hover:shadow-[0_16px_48px_-12px_rgba(212,150,122,0.1)] focus-visible:ring-2 focus-visible:ring-salt-pink focus-visible:ring-offset-2 focus-visible:ring-offset-cave-black"
                >
                  {cardInner(i)}
                </article>
              </div>
            ))}
          </div>
        </div>

        <div
          className="absolute bottom-6 left-5 right-5 hidden h-0.5 max-w-6xl overflow-hidden rounded-full bg-cave-charcoal lg:left-8 lg:right-8 lg:mx-auto lg:block"
          aria-hidden
        >
          <div
            ref={progressInnerRef}
            className="h-full w-full origin-left scale-x-0 bg-salt-pink will-change-transform"
          />
        </div>
      </div>

      <div ref={calloutRef} className="mx-auto max-w-[640px] px-5 pb-24 pt-4 text-center lg:px-8 lg:pb-28">
        <p className="font-sans text-base font-normal leading-relaxed text-text-primary">
          Ogni corpo è diverso. Per questo ti consigliamo sempre un ciclo personalizzato, calibrato sulle tue esigenze
          specifiche.
        </p>
        <Link
          ref={ctaRef}
          href="#prezzi"
          className="cta-focus-visible mt-8 inline-flex rounded-full bg-accent-cta px-8 py-4 font-sans text-sm font-medium text-cave-black transition-[transform,background-color] duration-300 [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)] hover:scale-[1.02] hover:bg-accent-cta-hover"
        >
          Scopri il percorso giusto per te
        </Link>
      </div>
    </section>
  )
}
