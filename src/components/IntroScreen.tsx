import Link from 'next/link'
import { routes } from '@/lib/routes'

export function IntroScreen() {
  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-cave-black font-sans">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at 50% 42%, #1a1812 0%, #0a0a08 62%)',
        }}
      />
      <div className="relative z-10 flex min-h-dvh items-center justify-center p-6">
        <div
          className="animate-modal-in w-full max-w-[480px] rounded-[24px] px-10 py-10 shadow-2xl sm:px-12 sm:py-12"
          style={{
            background: 'rgba(26, 24, 18, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <h1 className="font-display text-[clamp(1.75rem,4vw,2.35rem)] font-light tracking-wide text-salt-warm">
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
          <Link
            href={routes.contenuto}
            className="mt-5 block w-full text-center font-sans text-sm font-normal text-text-muted underline-offset-4 transition-colors hover:text-text-secondary hover:underline"
          >
            Vai direttamente al sito →
          </Link>
        </div>
      </div>
    </main>
  )
}
