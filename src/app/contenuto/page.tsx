'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SiteShell } from '@/components/SiteShell'
import { MarketingSections } from '@/components/MarketingSections'

function ContenutoInner() {
  const searchParams = useSearchParams()
  const animateIn = searchParams.get('from') === 'esperienza'
  return (
    <SiteShell>
      <MarketingSections animateIn={animateIn} />
    </SiteShell>
  )
}

export default function ContenutoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-transparent pt-[4.25rem] font-sans text-text-muted">
          Caricamento…
        </div>
      }
    >
      <ContenutoInner />
    </Suspense>
  )
}
