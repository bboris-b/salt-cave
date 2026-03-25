'use client'

import { createContext, useContext } from 'react'
import type Lenis from 'lenis'

export type SmoothScrollContextValue = {
  lenis: Lenis | null
  scroll: number
  limit: number
  progress: number
  reducedMotion: boolean
}

export const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(null)

export function useSmoothScroll(): SmoothScrollContextValue | null {
  return useContext(SmoothScrollContext)
}
