'use client'

type Props = {
  open: boolean
  exiting: boolean
  onStart: () => void
  onSkipToSite: () => void
}

export function WelcomeModal({ open, exiting, onStart, onSkipToSite }: Props) {
  if (!open && !exiting) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-6 transition-opacity duration-[600ms] ease-out ${
        exiting ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      style={{ background: 'rgba(10, 10, 8, 0.55)' }}
    >
      <div
        className="max-w-[480px] rounded-[24px] px-12 py-12 shadow-2xl"
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
        <button
          type="button"
          onClick={onStart}
          className="mt-8 w-full rounded-full bg-salt-pink py-3 font-sans text-sm font-medium text-cave-black transition-opacity hover:opacity-90"
        >
          Inizia l&apos;esperienza
        </button>
        <button
          type="button"
          onClick={onSkipToSite}
          className="mt-5 w-full text-center font-sans text-sm font-normal text-text-muted underline-offset-4 transition-colors hover:text-text-secondary hover:underline"
        >
          Vai direttamente al sito →
        </button>
      </div>
    </div>
  )
}
