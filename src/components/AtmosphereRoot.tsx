'use client'

import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'
import { AtmosphereCssFallback } from '@/components/AtmosphereCssFallback'
import { AtmosphereProvider } from './AtmosphereProvider'

const AtmosphericBackgroundLazy = dynamic(
  () => import('./AtmosphericBackground').then((m) => ({ default: m.AtmosphericBackground })),
  {
    ssr: false,
    loading: () => <AtmosphereCssFallback />,
  },
)

export function AtmosphereRoot({ children }: { children: ReactNode }) {
  return (
    <AtmosphereProvider>
      <AtmosphericBackgroundLazy />
      <div className="relative z-[1] min-h-dvh">{children}</div>
    </AtmosphereProvider>
  )
}
