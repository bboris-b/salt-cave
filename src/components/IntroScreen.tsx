'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAtmosphereRefs } from '@/components/AtmosphereProvider'
import { ATMOSPHERE_COLORS, DEFAULT_ATMOSPHERE_STATE } from '@/lib/atmosphereTypes'
import { routes } from '@/lib/routes'

type IntroScreenProps = {
  /** Stesso schermo intro su `/`: il salto al sito può restare sulla pagina. */
  variant?: 'default' | 'embedded'
  onSkipToSite?: () => void
}

export function IntroScreen({ variant = 'default', onSkipToSite }: IntroScreenProps) {
  const atmo = useAtmosphereRefs()
  useEffect(() => {
    if (!atmo) return
    atmo.bgTargetRef.current = ATMOSPHERE_COLORS.base
    atmo.stateRef.current = { ...DEFAULT_ATMOSPHERE_STATE }
  }, [atmo])

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-transparent font-sans">
      <div className="relative z-10 flex min-h-dvh items-center justify-center p-6">
        <div
          className="animate-modal-in w-full max-w-[480px] rounded-[24px] px-10 py-10 shadow-2xl sm:px-12 sm:py-12"
          style={{
            background: 'rgba(26, 24, 18, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <h1 className="type-display-section text-salt-warm">
            Grotta di Sale
          </h1>
          <p className="mt-2 font-sans text-base font-normal text-text-secondary">Un&apos;esperienza per il tuo respiro</p>
          <p className="mt-6 font-sans text-[14px] font-normal leading-[1.7] text-text-secondary">
            Vorremmo ascoltare il tuo respiro per offrirti un primo consiglio personalizzato. Ti chiederemo accesso al
            microfono. Per un&apos;esperienza migliore, cerca un ambiente tranquillo e tieni il dispositivo vicino al
            viso.
          </p>
          <Link
            href={routes.esperienza}
            className="mt-8 flex w-full items-center justify-center rounded-full bg-salt-pink py-3 text-center font-sans text-sm font-medium text-cave-black transition-opacity hover:opacity-90"
          >
            Inizia l&apos;esperienza
          </Link>
          {variant === 'embedded' && onSkipToSite ? (
            <button
              type="button"
              onClick={onSkipToSite}
              className="mt-5 block w-full text-center font-sans text-sm font-normal text-text-muted underline-offset-4 transition-colors hover:text-text-secondary hover:underline"
            >
              Vai direttamente al sito →
            </button>
          ) : (
            <Link
              href={routes.contenuto}
              className="mt-5 block w-full text-center font-sans text-sm font-normal text-text-muted underline-offset-4 transition-colors hover:text-text-secondary hover:underline"
            >
              Vai direttamente al sito →
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
