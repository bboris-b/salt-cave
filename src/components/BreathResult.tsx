'use client'

import type { BreathInsight } from '@/lib/breathPatterns'

type Props = {
  insight: BreathInsight
  visible: boolean
  onDiscover: () => void
}

export function BreathResult({ insight, visible, onDiscover }: Props) {
  if (!visible) return null

  return (
    <div className="absolute left-1/2 top-[calc(38%+min(42vw,168px))] z-[2] w-[min(90vw,400px)] -translate-x-1/2 animate-site-up text-center">
      <p className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-normal leading-tight tracking-wide text-salt-warm">
        {insight.rrLine}
      </p>
      <p className="mx-auto mt-4 max-w-[520px] font-sans text-base font-normal leading-[1.7] text-text-secondary">
        {insight.body}
      </p>
      <button
        type="button"
        onClick={onDiscover}
        className="mt-8 rounded-full bg-salt-pink px-8 py-3 font-sans text-sm font-medium text-cave-black transition-opacity hover:opacity-90"
      >
        Scopri la nostra grotta
      </button>
    </div>
  )
}
