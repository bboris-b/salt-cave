'use client'

import { useSmoothScroll } from '@/providers/SmoothScrollContext'

/** Progresso scroll normalizzato 0–1 (rispetto al limite Lenis). */
export function useScrollProgress(): number {
  const ctx = useSmoothScroll()
  return ctx?.progress ?? 0
}
