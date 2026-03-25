'use client'

import type { ReactNode } from 'react'
import { AtmosphereProvider } from './AtmosphereProvider'
import { AtmosphericBackground } from './AtmosphericBackground'

export function AtmosphereRoot({ children }: { children: ReactNode }) {
  return (
    <AtmosphereProvider>
      <AtmosphericBackground />
      <div className="relative z-[1] min-h-dvh">{children}</div>
    </AtmosphereProvider>
  )
}
