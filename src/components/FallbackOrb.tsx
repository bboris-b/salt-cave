'use client'

export function FallbackOrb() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[38%] h-[min(72vw,280px)] w-[min(72vw,280px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-salt-pink opacity-90"
      style={{
        filter: 'blur(40px)',
        animation: 'orb-breathe 4s ease-in-out infinite alternate',
      }}
    />
  )
}
