'use client'

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { gsap, initGsapPlugins } from '@/lib/gsap-init'
import { Button } from '@/components/ui/Button'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { setBookingPackageLabel } from '@/lib/bookingPackage'

const bookingLinkBase =
  'flex w-full items-center justify-center text-center font-sans text-sm font-medium outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-salt-pink focus-visible:ring-offset-2 focus-visible:ring-offset-cave-dark'
const bookingOutline = `${bookingLinkBase} rounded-[100px] border border-[var(--salt-pink)] bg-transparent px-6 py-3 text-[var(--salt-pink)] hover:bg-[var(--salt-pink)] hover:text-cave-black`
const bookingSolid = `${bookingLinkBase} rounded-[100px] bg-[var(--accent-cta)] px-6 py-3 text-cave-black hover:bg-[var(--accent-cta-hover)]`
const bookingAmber = `${bookingLinkBase} rounded-[100px] border border-salt-amber bg-transparent px-6 py-3 text-salt-amber hover:bg-salt-amber/10`

type WhoKey = 'me' | 'child' | 'family'
type FocusKey = 'breath' | 'stress' | 'skin' | 'prevention'

type Phase = 'quiz1' | 'quiz2' | 'packages'

type Props = {
  /** Percorso A: messaggio dal respiro; assente in Percorso B */
  breathingPersonalizedMessage?: string | null
}

const WHO_OPTIONS: { key: WhoKey; label: string; Icon: () => ReactElement }[] = [
  {
    key: 'me',
    label: 'Per me',
    Icon: IconPerson,
  },
  {
    key: 'child',
    label: 'Per mio figlio',
    Icon: IconChild,
  },
  {
    key: 'family',
    label: 'Per la famiglia',
    Icon: IconFamily,
  },
]

const FOCUS_OPTIONS: { key: FocusKey; label: string; Icon: () => ReactElement }[] = [
  { key: 'breath', label: 'Respiro difficile', Icon: IconLungs },
  { key: 'stress', label: 'Stress e ansia', Icon: IconMind },
  { key: 'skin', label: 'Problemi di pelle', Icon: IconDrop },
  { key: 'prevention', label: 'Prevenzione', Icon: IconShield },
]

const RECOMMENDATION_COPY: Record<`${WhoKey}-${FocusKey}`, string> = {
  'me-breath':
    'Per chi cerca sollievo sulle vie respiratorie, un ciclo strutturato dà spesso i risultati migliori. Ti consigliamo il percorso da 10 sedute.',
  'me-stress':
    'Respiro corto e tensione quotidiana spesso camminano insieme. Il microclima calmo della grotta può aiutarti a rallentare — il ciclo completo è pensato proprio per questo.',
  'me-skin':
    'Per il benessere della pelle, la haloterapia può affiancare le cure che segui già. Un percorso progressivo ti permette di valutare con calma come ti senti.',
  'me-prevention':
    'Per mantenere il benessere respiratorio nel tempo, alternare sedute singole a piccoli cicli stagionali è una scelta semplice ed efficace.',
  'child-breath':
    'Per i bambini con difficoltà respiratorie, consigliamo un ciclo di 10 sedute. I bambini sotto i 7 anni entrano gratis con te.',
  'child-stress':
    'Per i più piccoli, l’ambiente caldo e silenzioso della grotta può favorire il relax. Un ciclo con te al loro fianco è spesso l’approccio più sereno.',
  'child-skin':
    'Per i disturbi cutanei dei bambini vale sempre il parere del pediatra. In affiancamento, possiamo proporti un percorso leggero e personalizzato.',
  'child-prevention':
    'Per supportare il benessere respiratorio dei bambini con regolarità, chiedici come strutturare piccoli cicli durante l’anno.',
  'family-breath':
    'Quando in famiglia ci sono esigenze respiratorie diverse, il pacchetto da 10 sedute offre flessibilità — i bambini 0–7 sono gratuiti con un adulto.',
  'family-stress':
    'Condividere momenti di calma in famiglia può fare la differenza. Possiamo organizzare turni o sedute in base alle vostre disponibilità.',
  'family-skin':
    'Con esigenze diverse per ogni membro, spesso conviene un mix tra sedute singole e cicli: in sede troviamo insieme la formula adatta.',
  'family-prevention':
    'Per la prevenzione in famiglia, cicli stagionali o sedute condivise sono la scelta più pratica — te ne parliamo al telefono o in reception.',
}

function recommendationFor(who: WhoKey | null, focus: FocusKey | null): string {
  if (!who || !focus) {
    return 'In base alle tue risposte, ecco i pacchetti che meglio si adattano alla tua situazione.'
  }
  const k = `${who}-${focus}` as `${WhoKey}-${FocusKey}`
  return RECOMMENDATION_COPY[k] ?? 'Ecco i nostri pacchetti: scegli quello che risuona di più con il tuo momento.'
}

function IconPerson() {
  return (
    <svg width={32} height={32} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M16 15a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 26c0-4.5 3.6-8 8-8s8 3.5 8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconChild() {
  return (
    <svg width={32} height={32} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="11" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 26c0-3.5 2.8-6 6-6s6 2.5 6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconFamily() {
  return (
    <svg width={32} height={32} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="9" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="23" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 26c0-3 2-5 4-5M27 26c0-3-2-5-4-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 12v2c-2 0-4 2.2-4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconLungs() {
  return (
    <svg width={32} height={32} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M11 6c-2.5 3-4 7.5-4 12v6a3 3 0 0 0 3 3h1V9a3 3 0 0 0-3-3h-1Zm10 0c2.5 3 4 7.5 4 12v6a3 3 0 0 1-3 3h-1V9a3 3 0 0 1 3-3h1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconMind() {
  return (
    <svg width={32} height={32} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M16 7a6 6 0 0 0-6 6c0 2 1 3.5 2 4.5V25h8v-7.5c1-1 2-2.5 2-4.5a6 6 0 0 0-6-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 5l1 2M20 5l-1 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconDrop() {
  return (
    <svg width={32} height={32} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M16 5s-7 8.2-7 13a7 7 0 1 0 14 0c0-4.8-7-13-7-13Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconShield() {
  return (
    <svg width={32} height={32} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M16 4 9 7v8.5c0 4.2 3 8 7 9 4-1 7-4.8 7-9V7l-7-3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckLi({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2.5 text-sm font-normal leading-snug text-text-primary">
      <span className="mt-0.5 shrink-0 text-success" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M4 9.2 7.2 12.4 14 5.6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>{children}</span>
    </li>
  )
}

type QuizOptionProps = {
  selected: boolean
  onSelect: () => void
  label: string
  Icon: () => ReactElement
  reduced: boolean
}

function QuizOptionCard({ selected, onSelect, label, Icon, reduced }: QuizOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className={[
        'flex h-[120px] w-[120px] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-cave-charcoal bg-cave-dark px-2 text-center outline-none transition-[transform,border-color,background-color,color] duration-200 [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)]',
        'focus-visible:ring-2 focus-visible:ring-salt-pink focus-visible:ring-offset-2 focus-visible:ring-offset-cave-black',
        selected
          ? `border-2 border-salt-pink bg-salt-pink/[0.08] text-salt-pink ${reduced ? '' : 'scale-105'}`
          : 'border text-text-secondary hover:border-salt-pink/40',
      ].join(' ')}
    >
      <span className={selected ? 'text-salt-pink' : 'text-text-secondary'}>
        <Icon />
      </span>
      <span className={`font-sans text-[13px] font-normal leading-tight ${selected ? 'text-text-primary' : 'text-text-primary'}`}>
        {label}
      </span>
    </button>
  )
}

export function PrezziPacchettiSection({ breathingPersonalizedMessage = null }: Props) {
  const reduced = usePrefersReducedMotion()
  const personalized = Boolean(breathingPersonalizedMessage?.trim())
  const [introReady, setIntroReady] = useState(!personalized)
  const [phase, setPhase] = useState<Phase>('quiz1')
  const [who, setWho] = useState<WhoKey | null>(null)
  const [focus, setFocus] = useState<FocusKey | null>(null)

  const q1Id = useId()
  const q2Id = useId()
  const packagesRef = useRef<HTMLDivElement>(null)
  const discoveryRef = useRef<HTMLElement>(null)
  const exclusiveRef = useRef<HTMLElement>(null)
  const featuredRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!personalized) {
      setIntroReady(true)
      return
    }
    const t = window.setTimeout(() => setIntroReady(true), 50)
    return () => window.clearTimeout(t)
  }, [personalized])

  const goQuiz2 = useCallback(() => {
    if (who) setPhase('quiz2')
  }, [who])

  const goPackages = useCallback(() => {
    if (who && focus) setPhase('packages')
  }, [who, focus])

  useLayoutEffect(() => {
    if (phase !== 'packages') return
    initGsapPlugins()
    const root = packagesRef.current
    const d = discoveryRef.current
    const e = exclusiveRef.current
    const f = featuredRef.current
    if (!root || !d || !e || !f) return

    if (reduced) {
      gsap.set([d, e, f], { clearProps: 'all', opacity: 1, y: 0, scale: 1 })
      return
    }

    const ctx = gsap.context(() => {
      gsap.set([d, e, f], { opacity: 0, y: 40, scale: 0.96 })
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      tl.fromTo(d, { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, 0)
      tl.fromTo(e, { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, 0.12)
      tl.fromTo(
        f,
        { opacity: 0, y: 40, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' },
        0.24,
      )
    }, root)

    return () => ctx.revert()
  }, [phase, reduced])

  const quizSlideClass =
    phase === 'quiz1'
      ? 'translate-x-0'
      : phase === 'quiz2'
        ? '-translate-x-1/2'
        : '-translate-x-1/2'

  const showQuiz = phase === 'quiz1' || phase === 'quiz2'
  const resultsVisible = phase === 'packages'

  return (
    <section id="prezzi" className="scroll-mt-24 border-t border-cave-charcoal/40" aria-labelledby="prezzi-heading">
      <div className="mx-auto max-w-[1100px] px-5 py-20 lg:px-8 lg:py-24">
        {/* Intro */}
        <header className="mx-auto max-w-2xl text-center">
          {personalized ? (
            <div className={`transition-opacity duration-[800ms] ease-out ${introReady ? 'opacity-100' : 'opacity-0'}`}>
              <h2 id="prezzi-heading" className="type-display-section text-salt-warm">
                Il tuo respiro ci ha raccontato qualcosa
              </h2>
              <p
                className="mt-4 font-sans text-sm font-normal leading-relaxed text-text-secondary md:text-[15px]"
                aria-live="polite"
              >
                {breathingPersonalizedMessage}
              </p>
            </div>
          ) : (
            <div className={introReady ? 'opacity-100' : 'opacity-0'} style={{ transition: 'opacity 800ms ease-out' }}>
              <h2 id="prezzi-heading" className="type-display-section text-salt-warm">
                Trova il percorso giusto per te
              </h2>
              <p className="mt-4 font-sans text-sm font-normal leading-relaxed text-text-secondary md:text-[15px]">
                Ogni esigenza ha il suo pacchetto. Rispondi a due domande e ti consigliamo il migliore.
              </p>
            </div>
          )}
        </header>

        {/* Quiz + risultati */}
        <div className="relative mt-14 min-h-[200px]">
          <div
            className={`z-0 transition-opacity duration-500 ease-out ${resultsVisible ? 'pointer-events-none absolute inset-0 opacity-0' : 'relative opacity-100'}`}
            aria-hidden={resultsVisible}
          >
            <div className="overflow-hidden">
              <div
                className={`flex w-[200%] ${reduced ? '' : 'transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]'} ${quizSlideClass}`}
              >
                <div className="w-1/2 shrink-0 px-1">
                  <div className="mx-auto max-w-xl" role="radiogroup" aria-labelledby={q1Id}>
                    <p id={q1Id} className="mb-6 text-center font-sans text-base font-normal text-text-primary">
                      Per chi cerchi sollievo?
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      {WHO_OPTIONS.map((opt) => (
                        <QuizOptionCard
                          key={opt.key}
                          label={opt.label}
                          Icon={opt.Icon}
                          selected={who === opt.key}
                          onSelect={() => setWho(opt.key)}
                          reduced={reduced}
                        />
                      ))}
                    </div>
                    <div className="mt-8 flex justify-center">
                      <Button
                        type="button"
                        variant="solid"
                        disabled={!who}
                        className="!px-8 focus-visible:ring-2 focus-visible:ring-salt-pink focus-visible:ring-offset-2 focus-visible:ring-offset-cave-black disabled:pointer-events-none disabled:opacity-40"
                        onClick={goQuiz2}
                      >
                        Continua
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="w-1/2 shrink-0 px-1">
                  <div className="mx-auto max-w-xl" role="radiogroup" aria-labelledby={q2Id}>
                    <p id={q2Id} className="mb-6 text-center font-sans text-base font-normal text-text-primary">
                      Cosa ti pesa di più?
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      {FOCUS_OPTIONS.map((opt) => (
                        <QuizOptionCard
                          key={opt.key}
                          label={opt.label}
                          Icon={opt.Icon}
                          selected={focus === opt.key}
                          onSelect={() => setFocus(opt.key)}
                          reduced={reduced}
                        />
                      ))}
                    </div>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        className="focus-visible:ring-2 focus-visible:ring-salt-pink focus-visible:ring-offset-2 focus-visible:ring-offset-cave-black"
                        onClick={() => setPhase('quiz1')}
                      >
                        Indietro
                      </Button>
                      <Button
                        type="button"
                        variant="solid"
                        disabled={!focus}
                        className="!px-8 focus-visible:ring-2 focus-visible:ring-salt-pink focus-visible:ring-offset-2 focus-visible:ring-offset-cave-black disabled:pointer-events-none disabled:opacity-40"
                        onClick={goPackages}
                      >
                        Vedi i pacchetti
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`z-10 ease-out ${reduced ? '' : 'transition-all duration-500'} ${resultsVisible ? 'relative translate-y-0 opacity-100' : 'pointer-events-none absolute inset-0 translate-y-3 opacity-0'}`}
            aria-hidden={!resultsVisible}
          >
            <p
              role="status"
              aria-live="polite"
              className="mx-auto mb-10 max-w-2xl text-center font-sans text-sm font-normal leading-relaxed text-text-secondary md:text-[15px]"
            >
              {recommendationFor(who, focus)}
            </p>

            <div
              ref={packagesRef}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
            >
              <article
                ref={discoveryRef}
                className="package-card order-2 flex flex-col rounded-[20px] border border-cave-charcoal bg-cave-dark p-6 transition-[transform,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)] md:order-2 md:col-start-1 lg:order-1 lg:col-span-1 lg:col-start-auto hover:-translate-y-1.5 hover:shadow-[0_20px_48px_-16px_rgba(0,0,0,0.45)]"
              >
                <h3 className="type-display-card text-text-primary">Scoperta</h3>
                <p className="type-display-card mt-2 text-salt-pink">€25</p>
                <p className="mt-1 font-sans text-sm font-normal text-text-muted">Seduta singola · 45 min</p>
                <ul className="mt-6 flex flex-col gap-3">
                  <CheckLi>Accesso alla grotta</CheckLi>
                  <CheckLi>Copriscarpe e telo inclusi</CheckLi>
                  <CheckLi>Bambini 0–7 gratis</CheckLi>
                </ul>
                <div className="mt-auto pt-8">
                  <a
                    href="#prenotazione"
                    onClick={() => setBookingPackageLabel('Scoperta')}
                    className={`${bookingOutline} !py-3`}
                  >
                    Prenota
                  </a>
                </div>
              </article>

              <article
                ref={featuredRef}
                className="package-card order-1 flex flex-col rounded-[20px] border-2 border-salt-pink bg-cave-dark p-6 shadow-[0_0_40px_rgba(212,150,122,0.1)] transition-[transform,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)] md:order-1 md:col-span-2 lg:order-2 lg:col-span-1 md:max-lg:max-w-xl md:max-lg:justify-self-center hover:-translate-y-1.5 hover:shadow-[0_0_48px_rgba(212,150,122,0.18)]"
              >
                <span className="mb-3 inline-flex w-fit rounded-full bg-salt-pink px-3 py-1 font-sans text-xs font-medium text-cave-black">
                  Consigliato
                </span>
                <h3 className="type-display-card text-text-primary">Percorso</h3>
                <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="type-display-card text-salt-pink">€185</p>
                  <p className="font-sans text-xs font-normal text-text-muted">€18,50/seduta</p>
                </div>
                <p className="mt-1 font-sans text-sm font-normal text-text-muted">10 sedute · Il ciclo completo</p>
                <ul className="mt-6 flex flex-col gap-3">
                  <CheckLi>Tutto di &quot;Scoperta&quot;</CheckLi>
                  <CheckLi>Risparmio del 26%</CheckLi>
                  <CheckLi>Prenotazione prioritaria</CheckLi>
                  <CheckLi>Promemoria sedute</CheckLi>
                </ul>
                <div className="mt-auto pt-8">
                  <a
                    href="#prenotazione"
                    onClick={() => setBookingPackageLabel('Percorso')}
                    className={`${bookingSolid} !py-3`}
                  >
                    Inizia il percorso
                  </a>
                </div>
              </article>

              <article
                ref={exclusiveRef}
                className="package-card order-3 flex flex-col rounded-[20px] border border-cave-charcoal bg-cave-dark p-6 transition-[transform,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)] md:order-3 md:col-start-2 lg:order-3 lg:col-span-1 lg:col-start-auto hover:-translate-y-1.5 hover:shadow-[0_20px_48px_-16px_rgba(0,0,0,0.45)]"
              >
                <h3 className="type-display-card text-text-primary">Esclusiva</h3>
                <p className="type-display-card mt-2 text-salt-amber">€90</p>
                <p className="mt-1 font-sans text-sm font-normal text-text-muted">Grotta privata · 45 min</p>
                <ul className="mt-6 flex flex-col gap-3">
                  <CheckLi>Grotta tutta per te</CheckLi>
                  <CheckLi>Fino a 4 persone</CheckLi>
                  <CheckLi>Scelta musica/silenzio</CheckLi>
                  <CheckLi>Candele e aromaterapia</CheckLi>
                </ul>
                <div className="mt-auto pt-8">
                  <a
                    href="#prenotazione"
                    onClick={() => setBookingPackageLabel('Esclusiva')}
                    className={`${bookingAmber} !py-3`}
                  >
                    Prenota l&apos;esclusiva
                  </a>
                </div>
              </article>
            </div>

            <p className="mx-auto mt-10 max-w-xl text-center font-sans text-xs font-normal text-text-muted">
              Tutti i prezzi includono IVA. Annullamento gratuito fino a 24h prima.
            </p>

            <div className="mx-auto mt-16 max-w-md text-center">
              <p className="type-display-card text-salt-warm">
                Hai scelto il tuo percorso? Ora fermiamo il tuo posto.
              </p>
              <a
                href="#prenotazione"
                className="mx-auto mt-6 flex w-8 justify-center text-text-muted outline-none focus-visible:ring-2 focus-visible:ring-salt-pink focus-visible:ring-offset-2 focus-visible:ring-offset-cave-black rounded-full"
                aria-label="Vai alla prenotazione"
              >
                <span className="hero-scroll-hint inline-block">
                  <svg width="22" height="36" viewBox="0 0 22 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path
                      d="M11 2v24M3 18l8 8 8-8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.85"
                    />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
