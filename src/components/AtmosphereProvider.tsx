'use client'

import { createContext, useContext, useRef, type ReactNode } from 'react'
import { DEFAULT_ATMOSPHERE_STATE, type AtmosphereState } from '@/lib/atmosphereTypes'

export type AtmosphereContextValue = {
  stateRef: React.MutableRefObject<AtmosphereState>
  bgTargetRef: React.MutableRefObject<string>
}

const AtmosphereContext = createContext<AtmosphereContextValue | null>(null)

export function AtmosphereProvider({ children }: { children: ReactNode }) {
  const stateRef = useRef<AtmosphereState>({ ...DEFAULT_ATMOSPHERE_STATE })
  const bgTargetRef = useRef('#0A0A08')
  return (
    <AtmosphereContext.Provider value={{ stateRef, bgTargetRef }}>{children}</AtmosphereContext.Provider>
  )
}

export function useAtmosphereRefs(): AtmosphereContextValue | null {
  return useContext(AtmosphereContext)
}
