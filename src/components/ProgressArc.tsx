'use client'

type Props = {
  progress: number
  visible: boolean
}

const R = 42
const C = 2 * Math.PI * R

export function ProgressArc({ progress, visible }: Props) {
  const p = Math.min(1, Math.max(0, progress))
  const offset = C * (1 - p)

  if (!visible) return null

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[38%] z-[1] h-[min(78vw,300px)] w-[min(78vw,300px)] -translate-x-1/2 -translate-y-1/2"
      aria-hidden
    >
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle className="fill-none stroke-cave-dark/40" strokeWidth={1.5} cx="50" cy="50" r={R} />
        <circle
          className="fill-none stroke-salt-pink transition-[stroke-dashoffset] duration-300 ease-linear [stroke-linecap:round]"
          style={{ opacity: 0.6, strokeWidth: 1.5 }}
          cx="50"
          cy="50"
          r={R}
          strokeDasharray={`${C} ${C}`}
          strokeDashoffset={offset}
        />
      </svg>
    </div>
  )
}
