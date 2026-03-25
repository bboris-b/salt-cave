'use client'

import type { BreathInsight } from '@/lib/breathPatterns'

type Props = {
  insight: BreathInsight
  visible: boolean
  /** 0 = nascosto, 1 = solo RR, 2 = + messaggio, 3 = + CTA */
  staggerStep: number
  onDiscover: () => void
}

export function BreathResult({ insight, visible, staggerStep, onDiscover }: Props) {
  if (!visible) return null

  return (
    <div className="absolute left-1/2 top-[calc(38%+min(42vw,168px))] z-[2] w-[min(90vw,400px)] -translate-x-1/2 text-center">
      <p
        className={`font-display text-[clamp(1.5rem,3vw,2.25rem)] font-normal leading-tight tracking-wide text-salt-warm transition-all duration-[800ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${
          staggerStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
        }`}
      >
        {insight.rrLine}
      </p>
      <p
        className={`mx-auto mt-4 max-w-[520px] font-sans text-base font-normal leading-[1.7] text-text-secondary transition-all duration-[800ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${
          staggerStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
        }`}
        style={{ transitionDelay: staggerStep >= 2 ? '200ms' : '0ms' }}
      >
        {insight.body}
      </p>
      <div
        className={`transition-all duration-[800ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${
          staggerStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
        }`}
        style={{ transitionDelay: staggerStep >= 3 ? '500ms' : '0ms' }}
      >
        <button
          type="button"
          onClick={onDiscover}
          className="mt-8 rounded-full bg-salt-pink px-8 py-3 font-sans text-sm font-medium text-cave-black transition-opacity hover:opacity-90"
        >
          Scopri la nostra grotta
        </button>
      </div>
    </div>
  )
}
