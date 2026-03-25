'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAtmosphereRefs } from '@/components/AtmosphereProvider'
import { ATMOSPHERE_COLORS, DEFAULT_ATMOSPHERE_STATE } from '@/lib/atmosphereTypes'
import { routes } from '@/lib/routes'

type Props = {
  /** Se true, animazione ingresso (es. dopo esperienza) */
  animateIn?: boolean
}

export function ContenutoPlaceholder({ animateIn }: Props) {
  const atmo = useAtmosphereRefs()
  useEffect(() => {
    if (!atmo) return
    atmo.bgTargetRef.current = ATMOSPHERE_COLORS.baseDissolve
    atmo.stateRef.current = { ...DEFAULT_ATMOSPHERE_STATE }
  }, [atmo])

  return (
    <main
      className={`flex min-h-dvh flex-col items-center justify-center bg-transparent px-6 text-center font-sans ${
          animateIn ? 'animate-site-up' : ''
      }`}
    >
      <h1 className="type-display-section max-w-lg leading-snug text-salt-warm">
        45 minuti nella nostra grotta = 3 giorni di mare
      </h1>
      <p className="mt-4 max-w-md text-sm text-text-secondary">Continua a seguirci — il sito completo è in arrivo</p>
      <Link
        href={routes.intro}
        className="mt-10 font-sans text-sm text-text-muted underline-offset-4 transition-colors hover:text-text-secondary hover:underline"
      >
        ← Torna all&apos;intro
      </Link>
    </main>
  )
}
