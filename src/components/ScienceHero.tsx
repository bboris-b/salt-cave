'use client'

import { useLayoutEffect, useRef } from 'react'
import SplitType from 'split-type'
import { gsap, ScrollTrigger, initGsapPlugins } from '@/lib/gsap-init'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { HeroCaveParticles } from '@/components/HeroCaveVisual'

const TITLE = 'La scienza del sale'
const LABEL_DURATION = 0.6
const WORD_STAGGER = 0.1
const WORD_DURATION = 0.8
const AFTER_TITLE_PAUSE = 0.2
const LINE_STAGGER = 0.08
const LINE_DURATION = 0.8

export function ScienceHero() {
  const reduced = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const line1InnerRef = useRef<HTMLSpanElement>(null)
  const line2InnerRef = useRef<HTMLSpanElement>(null)
  const heroVisualRef = useRef<HTMLDivElement>(null)
  const heroVisualInnerRef = useRef<HTMLDivElement>(null)
  const captionRef = useRef<HTMLElement>(null)
  const arrowWrapRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    initGsapPlugins()
    const section = sectionRef.current
    const label = labelRef.current
    const titleEl = titleRef.current
    const l1 = line1InnerRef.current
    const l2 = line2InnerRef.current
    const heroVisual = heroVisualRef.current
    const heroInner = heroVisualInnerRef.current
    const caption = captionRef.current
    const arrowWrap = arrowWrapRef.current

    if (!section || !label || !titleEl || !l1 || !l2 || !arrowWrap) return

    let split: SplitType | null = null
    const cleanups: Array<() => void> = []

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([label, l1, l2, heroVisual, heroInner, caption, arrowWrap].filter(Boolean), { clearProps: 'all' })
        gsap.set(titleEl, { clearProps: 'fontVariationSettings' })
        gsap.set(label, { autoAlpha: 1 })
        gsap.set([l1, l2], { yPercent: 0 })
        if (heroVisual) gsap.set(heroVisual, { clipPath: 'inset(0% 0% 0% 0%)' })
        if (heroInner) gsap.set(heroInner, { yPercent: 0 })
        if (caption) gsap.set(caption, { autoAlpha: 1 })
        gsap.set(arrowWrap, { autoAlpha: 0.4 })
        return
      }

      if (heroVisual && heroInner && caption) {
        gsap.set(caption, { autoAlpha: 0 })
        const revealTl = gsap.timeline({
          scrollTrigger: {
            trigger: heroVisual,
            start: 'top 70%',
            once: true,
          },
        })
        revealTl.from(heroVisual, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 1.4,
          ease: 'power4.inOut',
        })
        revealTl.fromTo(caption, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, '>')

        gsap.to(heroInner, {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: heroVisual,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      }

      split = new SplitType(titleEl, { types: 'words', tagName: 'span' })
      const words = split.words
      if (!words?.length) {
        split.revert()
        split = null
        return
      }

      const vars = { wght: 300, wonk: 0 }
      const applyTitleVars = () => {
        gsap.set(titleEl, {
          fontVariationSettings: `"wght" ${vars.wght}, "WONK" ${vars.wonk}, "opsz" 72, "SOFT" 0`,
        })
      }
      applyTitleVars()

      const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
      const canFineHover =
        typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

      let hoverTween: gsap.core.Tween | null = null

      if (mobile) {
        gsap.to(vars, {
          wght: 600,
          ease: 'power2.out',
          duration: 0.85,
          onUpdate: applyTitleVars,
          scrollTrigger: {
            trigger: titleEl,
            start: 'top 80%',
            once: true,
          },
        })
      } else {
        ScrollTrigger.create({
          trigger: titleEl,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 1,
          onUpdate(self) {
            vars.wght = 300 + 300 * self.progress
            applyTitleVars()
          },
        })
      }

      if (canFineHover && !mobile) {
        const onEnter = () => {
          hoverTween?.kill()
          hoverTween = gsap.to(vars, {
            wonk: 1,
            duration: 0.6,
            ease: 'power2.out',
            onUpdate: applyTitleVars,
          })
        }
        const onLeave = () => {
          hoverTween?.kill()
          hoverTween = gsap.to(vars, {
            wonk: 0,
            duration: 0.6,
            ease: 'power2.out',
            onUpdate: applyTitleVars,
          })
        }
        titleEl.addEventListener('mouseenter', onEnter)
        titleEl.addEventListener('mouseleave', onLeave)
        cleanups.push(() => {
          titleEl.removeEventListener('mouseenter', onEnter)
          titleEl.removeEventListener('mouseleave', onLeave)
          hoverTween?.kill()
        })
      }

      gsap.set(label, { autoAlpha: 0 })
      gsap.set(words, { autoAlpha: 0, y: 60 })
      gsap.set([l1, l2], { yPercent: 100 })
      gsap.set(arrowWrap, { autoAlpha: 0.4 })

      const n = words.length
      const titleAnimSpan = (n - 1) * WORD_STAGGER + WORD_DURATION
      const subtitleStart = LABEL_DURATION + titleAnimSpan + AFTER_TITLE_PAUSE

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
      cleanups.forEach((fn) => fn())
      ctx.revert()
      split?.revert()
    }
  }, [reduced])

  return (
    <section
      ref={sectionRef}
      id="esperienza"
      className="mx-auto max-w-[1100px] scroll-mt-24 px-5 pb-16 pt-[12vh] md:px-6 md:pb-20 md:pt-[20vh]"
      aria-labelledby="science-hero-title"
    >
      <p
        ref={labelRef}
        className="type-label-uppercase mb-5 text-[var(--text-secondary)] md:mb-6"
      >
        Haloterapia
      </p>

      <div className="hero-title-var-wrap max-w-[22ch] md:max-w-none">
        <h1 id="science-hero-title" ref={titleRef} className="type-display-hero text-[var(--salt-warm)]">
          {TITLE}
        </h1>
      </div>

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

      <figure className="relative z-0 mx-auto mt-12 w-full md:mt-14">
        <div
          ref={heroVisualRef}
          className="hero-visual relative mx-auto w-full overflow-hidden rounded-2xl bg-cave-black max-md:aspect-[4/3] max-md:max-h-[50vh] max-md:min-h-[180px] md:h-[60vh] md:max-h-[600px] md:min-h-[260px]"
        >
          <div ref={heroVisualInnerRef} className="hero-visual-inner absolute inset-0 scale-[1.15] will-change-transform">
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
              <div className="hero-visual-glow-radial" />
            </div>
            <div className="hero-visual-grain pointer-events-none absolute inset-0 z-[1]" aria-hidden />
            <HeroCaveParticles />
            {/* Layer 3: quando disponibile, aggiungere <img className="absolute inset-0 z-[3] h-full w-full object-cover" alt="..." src="..." /> */}
          </div>
        </div>
        <figcaption
          ref={captionRef}
          className="mt-3 max-w-xl font-sans text-xs font-normal leading-relaxed text-[var(--text-muted)] md:text-[13px]"
        >
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
