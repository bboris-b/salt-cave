import './GrottaIntro.css'

type Props = {
  progress: number
  visible: boolean
}

const R = 42
const C = 2 * Math.PI * R

export function ProgressRing({ progress, visible }: Props) {
  const p = Math.min(1, Math.max(0, progress))
  const offset = C * (1 - p)

  if (!visible) return null

  return (
    <div className="grotta__ring-wrap" aria-hidden="true">
      <svg className="grotta__ring" viewBox="0 0 100 100">
        <circle className="grotta__ring-bg" cx="50" cy="50" r={R} />
        <circle
          className="grotta__ring-fg"
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
