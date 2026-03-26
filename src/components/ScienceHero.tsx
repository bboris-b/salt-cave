'use client'

import { useLayoutEffect, useRef } from 'react'
import SplitType from 'split-type'
import { gsap, ScrollTrigger, getScrollTriggerScroller, initGsapPlugins } from '@/lib/gsap-init'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const TITLE = 'Il tuo respiro merita uno spazio diverso.'

const SUBTITLE =
  'La prima grotta di sale terapeutica nel cuore di Roma. 45 minuti che cambiano il modo in cui respiri.'

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

    if (!section || !titleEl || !subtitleEl || !ctaEl || !microEl) return

    let splitTitle: SplitType | null = null

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([subtitleEl, ctaEl, microEl, overlayEl, clipEl, parallaxEl].filter(Boolean), { clearProps: 'all' })
        gsap.set([subtitleEl, ctaEl, microEl, overlayEl].filter(Boolean), { autoAlpha: 1 })
        gsap.set(ctaEl, { y: 0 })
        if (clipEl) gsap.set(clipEl, { clipPath: 'inset(0% 0% 0% 0%)' })
        if (parallaxEl) gsap.set(parallaxEl, { yPercent: 0 })
        return
      }

      gsap.set([subtitleEl, ctaEl, microEl, overlayEl].filter(Boolean), { autoAlpha: 0 })
      gsap.set(ctaEl, { y: 20 })

      const scroller = getScrollTriggerScroller()

      splitTitle = new SplitType(titleEl, { types: 'words', tagName: 'span' })
      const words = splitTitle.words
      if (!words?.length) {
        splitTitle.revert()
        splitTitle = null
      }

      const titleEnd =
        words && words.length > 0 ? (words.length - 1) * WORD_STAGGER + WORD_DURATION : WORD_DURATION

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

        const visualScrollTrigger = {
          scroller,
          trigger: clipEl,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        } as const

        ScrollTrigger.matchMedia({
          '(max-width: 767px)': function mobileVisual() {
            gsap.set(clipEl, { clipPath: 'inset(0% 0% 0% 0%)' })
            gsap.fromTo(
              clipEl,
              { autoAlpha: 0 },
              {
                autoAlpha: 1,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                  scroller,
                  trigger: clipEl,
                  start: 'top 85%',
                  toggleActions: 'play none none none',
                },
                onComplete: overlayAfterReveal,
              },
            )
            gsap.to(parallaxEl, {
              yPercent: -0.75,
              ease: 'none',
              scrollTrigger: { ...visualScrollTrigger },
            })
          },
          '(min-width: 768px)': function desktopVisual() {
            gsap.set(clipEl, { clipPath: 'inset(0 0 100% 0)' })
            gsap.to(clipEl, {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.4,
              ease: 'power4.inOut',
              scrollTrigger: {
                scroller,
                trigger: clipEl,
                start: 'top 80%',
                toggleActions: 'play none none none',
              },
              onComplete: overlayAfterReveal,
            })
            gsap.to(parallaxEl, {
              yPercent: -18,
              ease: 'none',
              scrollTrigger: { ...visualScrollTrigger },
            })
          },
        })
      }
    }, section)

    return () => {
      ctx.revert()
      splitTitle?.revert()
    }
  }, [reduced])

  return (
    <section ref={sectionRef} id="esperienza" className="scroll-mt-24" aria-labelledby="science-hero-title">
      <div className="mx-auto max-w-[800px] px-5 pb-10 pt-[12vh] md:pb-14 md:pt-[18vh]">
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

      <div className="hero-full-bleed my-8 md:my-14">
        <div
          ref={visualClipRef}
          className="hero-visual relative w-full overflow-hidden bg-cave-black min-h-[40vh] aspect-[4/3] md:aspect-auto md:min-h-[min(72vh,880px)]"
        >
          <div
            ref={visualParallaxRef}
            className="will-change-transform absolute inset-x-0 left-0 right-0 top-[-12%] h-[124%] w-full md:top-[-10%] md:h-[120%]"
            aria-hidden
          >
            <div className="hero-visual-media pointer-events-none absolute inset-0">
              <div className="hero-sensorial-radial" />
            </div>
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
    </section>
  )
}
