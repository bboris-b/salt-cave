'use client'

import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { SplitText } from '@/components/ui/SplitText'
import { PillTag } from '@/components/ui/PillTag'
import { ScienceHero } from '@/components/ScienceHero'
import { TestimonialSection } from '@/components/TestimonialSection'
import { PrezziPacchettiSection } from '@/components/PrezziPacchettiSection'
import { PrenotazioneSection } from '@/components/PrenotazioneSection'
import { useBreathingData } from '@/providers/BreathingDataProvider'

type Props = {
  /** Ingresso dopo esperienza (query ?from=esperienza) */
  animateIn?: boolean
}

export function MarketingSections({ animateIn }: Props) {
  const { data } = useBreathingData()

  return (
    <main
      className={`bg-transparent pb-28 font-sans lg:pb-16 ${animateIn ? 'animate-site-up' : ''}`.trim()}
    >
      <ScienceHero />

      {data ? (
        <section className="mx-auto max-w-3xl border-b border-cave-charcoal/60 px-5 py-10 text-center lg:px-8">
          <PillTag className="mb-4">Dal tuo respiro</PillTag>
          <p className="type-display-lead text-salt-warm">{data.headline}</p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-text-secondary">{data.personalizedMessage}</p>
          <p className="mt-4 text-xs text-text-muted">
            RR {data.respiratoryRate.toFixed(1)}/min · rapporto I:E {data.inhaleExhaleRatio.toFixed(2)}
          </p>
        </section>
      ) : null}

      <section id="accoglienza" className="mx-auto max-w-3xl scroll-mt-24 px-5 py-24 lg:px-8">
        <ScrollReveal>
          <PillTag>L&apos;esperienza</PillTag>
        </ScrollReveal>
        <div className="mt-6">
          <h2 className="type-display-section text-text-primary">
            <SplitText type="words" as="span" className="inline" animate={{ stagger: 0.05, y: 10 }}>
              Un tempo per te, tra luci calde e sale micronizzato.
            </SplitText>
          </h2>
        </div>
        <ScrollReveal className="mt-5" delay={120}>
          <p className="max-w-xl text-sm leading-relaxed text-text-secondary">
            Respira in un ambiente studiato per favorire relax e benessere delle vie respiratorie. Il percorso introduttivo
            che hai scelto ci aiuta a proporti un messaggio più vicino al tuo ritmo.
          </p>
        </ScrollReveal>
      </section>

      <section id="benefici" className="mx-auto max-w-3xl scroll-mt-24 border-t border-cave-charcoal/40 px-5 py-24 lg:px-8">
        <ScrollReveal>
          <h2 className="type-display-section text-salt-warm">Benefici</h2>
        </ScrollReveal>
        <ScrollReveal className="mt-4">
          <p className="text-sm leading-relaxed text-text-secondary">
            Haloterapia, microclima controllato, supporto al benessere respiratorio e stress quotidiano — senza sostituire
            il parere medico.
          </p>
        </ScrollReveal>
      </section>

      <TestimonialSection />

      <PrezziPacchettiSection breathingPersonalizedMessage={data?.personalizedMessage ?? null} />

      <PrenotazioneSection />

      <section id="chi-siamo" className="mx-auto max-w-3xl scroll-mt-24 border-t border-cave-charcoal/40 px-5 py-24 lg:px-8">
        <ScrollReveal>
          <h2 className="type-display-section text-salt-warm">Chi siamo</h2>
        </ScrollReveal>
        <ScrollReveal className="mt-4">
          <p className="text-sm text-text-secondary">La nostra grotta di sale — identità e storia del centro.</p>
        </ScrollReveal>
      </section>
    </main>
  )
}
