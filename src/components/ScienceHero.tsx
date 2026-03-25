'use client'

import { useLayoutEffect, useRef } from 'react'
import SplitType from 'split-type'
import { gsap, ScrollTrigger, initGsapPlugins } from '@/lib/gsap-init'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const TITLE = 'La scienza del sale'
const LABEL_DURATION = 0.6
const WORD_STAGGER = 0.1
const WORD_DURATION = 0.8
const AFTER_TITLE_PAUSE = 0.2
const LINE_STAGGER = 0.08
const LINE_DURATION = 0.8
const VISUAL_DURATION = 1.2
const SUBTITLE_OVERLAP = 0.6

function SaltCrystalVisual() {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 800 450"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <pattern id="salt-hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path
            d="M24 0 L48 12 L48 36 L24 48 L0 36 L0 12 Z"
            stroke="var(--salt-pink)"
            strokeOpacity="0.35"
            strokeWidth="0.6"
            fill="none"
          />
        </pattern>
        <linearGradient id="salt-hero-fade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--salt-amber)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--salt-pink)" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#salt-hero-grid)" opacity="0.5" />
      <g opacity="0.55">
        <path
          d="M400 48 L472 140 L400 232 L328 140 Z"
          stroke="var(--salt-pink)"
          strokeWidth="1.2"
          fill="var(--salt-amber)"
          fillOpacity="0.15"
        />
        <path
          d="M220 120 L288 210 L220 300 L152 210 Z"
          stroke="var(--salt-amber)"
          strokeWidth="1"
          fill="var(--salt-pink)"
          fillOpacity="0.12"
        />
        <path
          d="M580 160 L652 248 L580 336 L508 248 Z"
          stroke="var(--salt-pink)"
          strokeWidth="1"
          fill="none"
          strokeOpacity="0.5"
        />
        <path
          d="M120 320 L200 380 L120 420 L40 380 Z"
          stroke="var(--salt-amber)"
          strokeOpacity="0.4"
          strokeWidth="0.9"
          fill="none"
        />
        <path
          d="M640 60 L720 120 L640 180 L560 120 Z"
          stroke="var(--salt-pink)"
          strokeOpacity="0.35"
          strokeWidth="0.8"
          fill="none"
        />
        <path
          d="M260 40 L340 100 L260 160 L180 100 Z"
          stroke="var(--salt-amber)"
          strokeOpacity="0.45"
          strokeWidth="0.7"
          fill="var(--salt-pink)"
          fillOpacity="0.08"
        />
        <path
          d="M480 280 L560 340 L480 400 L400 340 Z"
          stroke="var(--salt-pink)"
          strokeOpacity="0.42"
          strokeWidth="0.85"
          fill="none"
        />
      </g>
      <rect
        width="800"
        height="450"
        fill="url(#salt-hero-fade)"
        opacity="0.35"
        className="mix-blend-soft-light"
      />
    </svg>
  )
}

export function ScienceHero() {
  const reduced = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const line1InnerRef = useRef<HTMLSpanElement>(null)
  const line2InnerRef = useRef<HTMLSpanElement>(null)
  const visualRef = useRef<HTMLDivElement>(null)
  const arrowWrapRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    initGsapPlugins()
    const section = sectionRef.current
    const label = labelRef.current
    const titleEl = titleRef.current
    const l1 = line1InnerRef.current
    const l2 = line2InnerRef.current
    const visual = visualRef.current
    const arrowWrap = arrowWrapRef.current

    if (!section || !label || !titleEl || !l1 || !l2 || !visual || !arrowWrap) return

    let split: SplitType | null = null

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([label, l1, l2, visual, arrowWrap], { clearProps: 'all' })
        gsap.set(label, { autoAlpha: 1 })
        gsap.set([l1, l2], { yPercent: 0 })
        gsap.set(visual, { clipPath: 'inset(0% 0% 0% 0%)' })
        gsap.set(arrowWrap, { autoAlpha: 0.4 })
        return
      }

      split = new SplitType(titleEl, { types: 'words', tagName: 'span' })
      const words = split.words
      if (!words?.length) {
        split.revert()
        split = null
        return
      }

      const n = words.length
      const titleAnimSpan = (n - 1) * WORD_STAGGER + WORD_DURATION
      const subtitleStart = LABEL_DURATION + titleAnimSpan + AFTER_TITLE_PAUSE
      const numLines = 2
      const subtitleTotal = (numLines - 1) * LINE_STAGGER + LINE_DURATION
      const visualStart = subtitleStart + SUBTITLE_OVERLAP * subtitleTotal

      gsap.set(label, { autoAlpha: 0 })
      gsap.set(words, { autoAlpha: 0, y: 60 })
      gsap.set([l1, l2], { yPercent: 100 })
      gsap.set(visual, { clipPath: 'inset(100% 0% 0% 0%)' })
      gsap.set(arrowWrap, { autoAlpha: 0.4 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          once: true,
        },
      })

      tl.fromTo(label, { autoAlpha: 0 }, { autoAlpha: 1, duration: LABEL_DURATION, ease: 'power2.out' })
      tl.from(
        words,
        {
          y: 60,
          autoAlpha: 0,
          duration: WORD_DURATION,
          stagger: WORD_STAGGER,
          ease: 'power3.out',
        },
        LABEL_DURATION,
      )
      tl.fromTo(
        l1,
        { yPercent: 100 },
        { yPercent: 0, duration: LINE_DURATION, ease: 'power4.out' },
        subtitleStart,
      )
      tl.fromTo(
        l2,
        { yPercent: 100 },
        { yPercent: 0, duration: LINE_DURATION, ease: 'power4.out' },
        subtitleStart + LINE_STAGGER,
      )
      tl.fromTo(
        visual,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: VISUAL_DURATION, ease: 'power4.inOut' },
        visualStart,
      )

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=140',
        scrub: true,
        onUpdate: (self) => {
          gsap.set(arrowWrap, { autoAlpha: 0.4 * (1 - self.progress) })
        },
      })
    }, section)

    return () => {
      ctx.revert()
      split?.revert()
    }
  }, [reduced])

  return (
    <section
      ref={sectionRef}
      id="esperienza"
      className="mx-auto max-w-[960px] scroll-mt-24 px-5 pb-16 pt-[12vh] md:px-6 md:pb-20 md:pt-[20vh]"
      aria-labelledby="science-hero-title"
    >
      <p
        ref={labelRef}
        className="mb-5 font-sans text-[11px] font-normal uppercase tracking-[0.2em] text-[var(--text-secondary)] md:mb-6 md:text-xs"
      >
        Haloterapia
      </p>

      <h1
        id="science-hero-title"
        ref={titleRef}
        className="max-w-[22ch] font-display text-[clamp(2.15rem,7vw,3.75rem)] font-light leading-[1.08] text-[var(--salt-warm)] md:max-w-none md:text-[clamp(2.75rem,6.2vw,4rem)]"
      >
        {TITLE}
      </h1>

      <div className="mt-8 max-w-[600px] space-y-0 md:mt-10">
        <div className="overflow-hidden font-sans text-lg font-normal leading-snug text-[var(--text-primary)] md:text-[18px] md:leading-relaxed">
          <span ref={line1InnerRef} className="block">
            45 minuti nella nostra grotta equivalgono a{' '}
          </span>
        </div>
        <div className="overflow-hidden font-sans text-lg font-normal leading-snug md:text-[18px] md:leading-relaxed">
          <span ref={line2InnerRef} className="block font-medium text-salt-pink">3 giorni di aria di mare</span>
        </div>
      </div>

      <figure className="mt-12 w-full md:mt-14">
        <div ref={visualRef} className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-cave-dark md:aspect-video">
          <SaltCrystalVisual />
        </div>
        <figcaption className="mt-3 max-w-xl font-sans text-xs font-normal leading-relaxed text-[var(--text-muted)] md:text-[13px]">
          Sale Rosa dell&apos;Himalaya, nebulizzato a particelle microscopiche
        </figcaption>
      </figure>

      <div ref={arrowWrapRef} className="mx-auto mt-10 flex w-8 justify-center md:mt-12" aria-hidden>
        <div className="hero-scroll-hint text-[var(--text-muted)]">
          <svg width="22" height="36" viewBox="0 0 22 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M11 2v24M3 18l8 8 8-8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />
          </svg>
        </div>
      </div>
    </section>
  )
}
