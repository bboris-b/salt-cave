'use client'

type Props = {
  progress: number
  visible: boolean
  flash: boolean
  hide: boolean
}

function formatTime(seconds: number): string {
  const s = Math.floor(seconds)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

export function SessionTimer({ progress, visible, flash, hide }: Props) {
  if (!visible && hide) return null

  const elapsed = progress * 60
  const label = formatTime(elapsed)

  return (
    <div
      className={`pointer-events-none absolute left-1/2 top-[12%] z-[5] -translate-x-1/2 font-sans text-sm font-medium tracking-wide ${
        hide ? 'opacity-0' : 'opacity-100'
      } ${flash ? 'text-salt-warm' : 'text-text-secondary'} transition-[color] duration-200 ease-out transition-opacity duration-400`}
    >
      {visible ? label : null}
    </div>
  )
}
