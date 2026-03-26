import { Suspense } from 'react'
import { HomeClient } from '@/app/home-client'

function HomeFallback() {
  return <div className="min-h-dvh bg-transparent" aria-busy aria-label="Caricamento" />
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeClient />
    </Suspense>
  )
}
