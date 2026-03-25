'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ContenutoPlaceholder } from '@/components/ContenutoPlaceholder'

function ContenutoInner() {
  const searchParams = useSearchParams()
  const animateIn = searchParams.get('from') === 'esperienza'
  return <ContenutoPlaceholder animateIn={animateIn} />
}

export default function ContenutoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-transparent font-sans text-text-muted">
          Caricamento…
        </div>
      }
    >
      <ContenutoInner />
    </Suspense>
  )
}
