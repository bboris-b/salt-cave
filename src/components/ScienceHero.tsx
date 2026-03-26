'use client'

import { useLayoutEffect, useRef } from 'react'
import SplitType from 'split-type'
import { gsap, ScrollTrigger, initGsapPlugins } from '@/lib/gsap-init'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const TITLE = 'Il tuo respiro merita uno spazio diverso.'

const SUBTITLE =
  'La prima grotta di sale terapeutica nel cuore di Roma. 45 minuti che cambiano il modo in cui respiri.'

const NARRATIVE = `Immagina 45 minuti di silenzio. L'aria è tiepida, sa di mare. Sei sdraiato su una chaise longue, avvolto da pareti di sale rosa dell'Himalaya. Sopra di te, un soffitto di cristalli. Un nebulizzatore diffonde microparticelle di sale nell'aria — così piccole che le respiri senza accorgertene. Il tuo corpo fa il resto.`

const DATA_LINE = "In una seduta respiri l'equivalente di 3 giorni di aria di mare."

const HALO_LINE = 'Si chiama haloterapia. Ed è la cosa più vicina al mare che puoi trovare a Roma.'

const WORD_STAGGER = 0.1
const WORD_DURATION = 0.8

const ctaClass =
  'cta-focus-visible inline-flex items-center justify-center rounded-[100px] bg-[var(--accent-cta)] px-9 py-4 font-sans text-[15px] font-medium leading-none text-cave-black transition-colors duration-300 hover:bg-[var(--accent-cta-hover)]'

export function ScienceHero() {
  const reduced = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)
  const microRef = useRef<HTMLParagraphElement>(null)
  const visualClipRef = useRef<HTMLDivElement>(null)
  const visualParallaxRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLParagraphElement>(null)
  const narrativeRef = useRef<HTMLParagraphElement>(null)
  const dataRef = useRef<HTMLParagraphElement>(null)
  const haloRef = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    initGsapPlugins()
    const section = sectionRef.current
    const titleEl = titleRef.current
    const subtitleEl = subtitleRef.current
    const ctaEl = ctaRef.current
    const microEl = microRef.current
    const clipEl = visualClipRef.current
    const parallaxEl = visualParallaxRef.current
    const overlayEl = overlayRef.current
    const narrativeEl = narrativeRef.current
    const dataEl = dataRef.current
    const haloEl = haloRef.current

    if (!section || !titleEl || !subtitleEl || !ctaEl || !microEl || !narrativeEl || !dataEl || !haloEl) return

    let splitTitle: SplitType | null = null
    let splitNarrative: SplitType | null = null

    const narrowVisual =
      typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(
          [subtitleEl, ctaEl, microEl, overlayEl, narrativeEl, dataEl, haloEl, clipEl, parallaxEl].filter(Boolean),
          { clearProps: 'all' },
        )
        gsap.set([subtitleEl, ctaEl, microEl, overlayEl, narrativeEl, dataEl, haloEl], { autoAlpha: 1 })
        gsap.set(ctaEl, { y: 0 })
        if (clipEl) gsap.set(clipEl, { clipPath: 'inset(0% 0% 0% 0%)' })
        if (parallaxEl) gsap.set(parallaxEl, { yPercent: 0 })
        return
      }

      gsap.set([subtitleEl, ctaEl, microEl, overlayEl], { autoAlpha: 0 })
      gsap.set(ctaEl, { y: 20 })
      gsap.set([narrativeEl, dataEl, haloEl], { autoAlpha: 0 })
      gsap.set(dataEl, { x: -20 })

      splitTitle = new SplitType(titleEl, { types: 'words', tagName: 'span' })
      const words = splitTitle.words
      if (!words?.length) {
        splitTitle.revert()
        splitTitle = null
      }

      const titleEnd =
        words && words.length > 0 ? (words.length - 1) * WORD_STAGGER + WORD_DURATION : WORD_DURATION

      /* Nessuno ScrollTrigger: titolo, sottotitolo e CTA devono animare nel primo viewport */
      const entrance = gsap.timeline({ delay: 0.1 })

      if (words?.length) {
        gsap.set(words, { autoAlpha: 0, y: 50 })
        entrance.fromTo(
          words,
          { autoAlpha: 0, y: 50 },
          {
            autoAlpha: 1,
            y: 0,
            duration: WORD_DURATION,
            stagger: WORD_STAGGER,
            ease: 'power3.out',
          },
          0,
        )
      } else {
        gsap.set(titleEl, { autoAlpha: 1 })
      }

      entrance.fromTo(subtitleEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, titleEnd + 0.4)
      entrance.fromTo(
        ctaEl,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        titleEnd + 0.8,
      )
      entrance.fromTo(microEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, titleEnd + 1.05)

      if (clipEl && parallaxEl && overlayEl) {
        const overlayAfterReveal = () => {
          gsap.fromTo(
            overlayEl,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.8, ease: 'power2.out', delay: 0.6 },
          )
        }

        if (narrowVisual) {
          gsap.set(clipEl, { clipPath: 'inset(0% 0% 0% 0%)' })
          gsap.fromTo(
            clipEl,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              duration: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: clipEl,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
              onComplete: overlayAfterReveal,
            },
          )
        } else {
          gsap.from(clipEl, {
            clipPath: 'inset(0 0 100% 0)',
            duration: 1.4,
            ease: 'power4.inOut',
            scrollTrigger: {
              trigger: clipEl,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            onComplete: overlayAfterReveal,
          })
        }

        gsap.to(parallaxEl, {
          yPercent: narrowVisual ? -15 * 0.05 : -15,
          ease: 'none',
          scrollTrigger: {
            trigger: clipEl,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      }

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
          trigger: dataEl,
          start: 'top 82%',
          once: true,
        },
      })
      tailTl.fromTo(dataEl, { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.8, ease: 'power3.out' })
      tailTl.fromTo(haloEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.65, ease: 'power2.out' }, '-=0.35')
    }, section)

    return () => {
      ctx.revert()
      splitNarrative?.revert()
      splitTitle?.revert()
    }
  }, [reduced])

  return (
    <section ref={sectionRef} id="esperienza" className="scroll-mt-24" aria-labelledby="science-hero-title">
      {/* VIEWPORT 1 — ponte emotivo + posizionamento */}
      <div className="mx-auto max-w-[800px] px-5 pb-14 pt-[12vh] md:pb-20 md:pt-[20vh]">
        <div className="hero-title-var-wrap">
          <h1 id="science-hero-title" ref={titleRef} className="animate-weight type-hero-ingresso">
            {TITLE}
          </h1>
        </div>

        <p
          ref={subtitleRef}
          className="mt-6 max-w-[540px] font-sans font-normal leading-relaxed text-[var(--text-secondary)] [font-size:clamp(1rem,1.2vw,1.15rem)]"
        >
          {SUBTITLE}
        </p>

        <a ref={ctaRef} href="#prenotazione" className={`${ctaClass} mt-8`}>
          Prenota la tua prima seduta
        </a>

        <p ref={microRef} className="mt-4 font-sans text-[13px] font-normal leading-relaxed text-[var(--text-muted)]">
          Da €25 · Annullamento gratuito · Risposta in 1h
        </p>
      </div>

      {/* VIEWPORT 2 — visual full-bleed */}
      <div className="hero-full-bleed my-16 md:my-24">
        <div
          ref={visualClipRef}
          className="hero-visual relative w-full overflow-hidden bg-cave-black aspect-video max-md:aspect-[4/3]"
        >
          <div
            ref={visualParallaxRef}
            className="will-change-transform absolute inset-x-0 left-0 right-0 top-[-8%] h-[116%] w-full"
            aria-hidden
          >
            <div className="hero-sensorial-radial" />
            <div className="hero-visual-grain pointer-events-none absolute inset-0 z-[1]" />
          </div>
          <p
            ref={overlayRef}
            className="type-hero-visual-quote hero-visual-overlay-shadow pointer-events-none absolute bottom-0 left-0 right-0 z-10 px-6 pb-10 pt-16 text-center md:px-12 md:pb-14"
          >
            Entra. Respira. Lascia fuori il resto.
          </p>
        </div>
      </div>

      {/* VIEWPORT 3 — narrativa sensoriale */}
      <div className="mx-auto max-w-[800px] px-5 pb-20 md:pb-28">
        <p
          ref={narrativeRef}
          className="science-hero-narrative max-w-[640px] font-sans font-normal leading-[1.8] text-[var(--text-primary)] [font-size:clamp(1rem,1.1vw,1.125rem)]"
        >
          {NARRATIVE}
        </p>

        <p
          ref={dataRef}
          className="type-hero-data mt-12 max-w-[640px] border-l-2 border-salt-pink pl-5 md:pl-[20px]"
        >
          {DATA_LINE}
        </p>

        <p ref={haloRef} className="mt-6 max-w-[640px] font-sans text-base font-normal leading-relaxed text-[var(--text-secondary)]">
          {HALO_LINE}
        </p>
      </div>
    </section>
  )
}
