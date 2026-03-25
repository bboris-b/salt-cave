'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { BreathPatternKey } from '@/lib/breathPatterns'

const STORAGE_KEY = 'salt-cave-breathing-v1'

export type BreathingAnalysisData = {
  /** Respiri al minuto */
  respiratoryRate: number
  /** Rapporto inspirazione : espirazione (Ti/Te) */
  inhaleExhaleRatio: number
  patternKey: BreathPatternKey
  /** Messaggio personalizzato (corpo) */
  personalizedMessage: string
  /** Titolo / riga RR */
  headline: string
}

type BreathingDataContextValue = {
  data: BreathingAnalysisData | null
  setBreathingData: (payload: BreathingAnalysisData) => void
  clearBreathingData: () => void
}

const BreathingDataContext = createContext<BreathingDataContextValue | null>(null)

function readStored(): BreathingAnalysisData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as BreathingAnalysisData
  } catch {
    return null
  }
}

export function BreathingDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<BreathingAnalysisData | null>(null)

  useEffect(() => {
    setData(readStored())
  }, [])

  const setBreathingData = useCallback((payload: BreathingAnalysisData) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      /* ignore */
    }
    setData(payload)
  }, [])

  const clearBreathingData = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    setData(null)
  }, [])

  const value = useMemo(
    () => ({
      data,
      setBreathingData,
      clearBreathingData,
    }),
    [clearBreathingData, data, setBreathingData],
  )

  return <BreathingDataContext.Provider value={value}>{children}</BreathingDataContext.Provider>
}

export function useBreathingData(): BreathingDataContextValue {
  const ctx = useContext(BreathingDataContext)
  if (!ctx) {
    throw new Error('useBreathingData must be used within BreathingDataProvider')
  }
  return ctx
}
