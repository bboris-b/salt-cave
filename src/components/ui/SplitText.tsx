'use client'

import { createElement, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import SplitType from 'split-type'
import { gsap, ScrollTrigger, initGsapPlugins } from '@/lib/gsap-init'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export type SplitTextType = 'words' | 'chars' | 'lines'

type AnimOptions = {
  duration?: number
  stagger?: number
  delay?: number
  y?: number
  ease?: string
}

type Props = {
  children: ReactNode
  type?: SplitTextType
  className?: string
  as?: keyof JSX.IntrinsicElements
  animate?: AnimOptions
}

const DEBOUNCE_MS = 300

export function SplitText({
  children,
  type = 'words',
  className = '',
  as: Tag = 'span',
  animate = {},
}: Props) {
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLElement | null>(null)
  const splitRef = useRef<SplitType | null>(null)
  const ctxRef = useRef<gsap.Context | null>(null)
  const text = typeof children === 'string' ? children : ''
  const [fallback, setFallback] = useState(text)

  useEffect(() => {
    if (typeof children === 'string') setFallback(children)
  }, [children])

  const {
    duration = 0.55,
    stagger = 0.04,
    delay = 0,
    y = 12,
    ease = 'power2.out',
  } = animate

  useLayoutEffect(() => {
    initGsapPlugins()
    const el = rootRef.current
    if (!el || reduced) {
      ctxRef.current?.revert()
      ctxRef.current = null
      splitRef.current?.revert()
      splitRef.current = null
      return
    }

    const run = () => {
      ctxRef.current?.revert()
      ctxRef.current = null
      splitRef.current?.revert()
      splitRef.current = null

      const instance = new SplitType(el, { types: type, tagName: 'span' })
      splitRef.current = instance

      const targets =
        type === 'chars'
          ? instance.chars
          : type === 'words'
            ? instance.words
            : instance.lines

      if (!targets?.length) return

      ctxRef.current = gsap.context(() => {
        gsap.from(targets, {
          y,
          autoAlpha: 0,
          duration,
          stagger,
          delay,
          ease,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        })
      }, el)
    }

    run()

    let debounce: ReturnType<typeof setTimeout> | null = null
    const onResize = () => {
      if (debounce) clearTimeout(debounce)
      debounce = setTimeout(() => {
        debounce = null
        run()
        ScrollTrigger.refresh()
      }, DEBOUNCE_MS)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      if (debounce) clearTimeout(debounce)
      ctxRef.current?.revert()
      ctxRef.current = null
      splitRef.current?.revert()
      splitRef.current = null
    }
  }, [children, type, reduced, duration, stagger, delay, y, ease])

  const show = typeof children === 'string' ? children : fallback

  if (reduced || typeof children !== 'string') {
    return createElement(Tag, { ref: rootRef, className }, show)
  }

  return createElement(Tag, { ref: rootRef, className }, children)
}
