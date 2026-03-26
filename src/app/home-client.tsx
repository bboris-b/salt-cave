'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { IntroScreen } from '@/components/IntroScreen'
import { SiteShell } from '@/components/SiteShell'
import { MarketingSections } from '@/components/MarketingSections'
import { useBreathingData } from '@/providers/BreathingDataProvider'

export function HomeClient() {
  const searchParams = useSearchParams()
  const animateIn = searchParams.get('from') === 'esperienza'
  const [showIntro, setShowIntro] = useState(true)
  const { clearBreathingData } = useBreathingData()

  if (showIntro) {
    return (
      <IntroScreen
        variant="embedded"
        onSkipToSite={() => {
          clearBreathingData()
          setShowIntro(false)
        }}
      />
    )
  }

  return (
    <SiteShell navbarEntrance="fadeUp">
      <MarketingSections animateIn={animateIn} />
    </SiteShell>
  )
}
