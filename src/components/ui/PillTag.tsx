import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export function PillTag({ children, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-[100px] border border-cave-charcoal/80 bg-cave-dark/60 px-3 py-1 font-sans text-xs font-normal text-text-secondary backdrop-blur-sm ${className}`.trim()}
    >
      {children}
    </span>
  )
}
