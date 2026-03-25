'use client'

import { useState } from 'react'
import { IntroScreen } from '@/components/IntroScreen'
import { SiteShell } from '@/components/SiteShell'
import { MarketingSections } from '@/components/MarketingSections'
import { useBreathingData } from '@/providers/BreathingDataProvider'

export default function HomePage() {
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
    <SiteShell>
      <MarketingSections />
    </SiteShell>
  )
}
