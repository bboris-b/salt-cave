'use client'

import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { PillTag } from '@/components/ui/PillTag'
import { BeneficiPinnedSection } from '@/components/BeneficiPinnedSection'
import { ScienceHero } from '@/components/ScienceHero'
import { CommercialStatsStrip } from '@/components/CommercialStatsStrip'
// Testimonial: nascosto finché il negozio non ha recensioni reali — riattivare import + JSX sotto
// import { TestimonialSection } from '@/components/TestimonialSection'
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

      <section id="accoglienza" className="mx-auto max-w-3xl scroll-mt-24 px-5 py-20 lg:px-8 lg:py-24">
        <ScrollReveal>
          <PillTag>L&apos;esperienza</PillTag>
        </ScrollReveal>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-text-secondary">
          Ogni seduta è tempo solo per te. Qui sotto trovi come la grotta sostiene benessere e respiro — senza sostituire il
          parere del medico.
        </p>
      </section>

      <BeneficiPinnedSection />

      {/*
        ═══ TESTIMONIALS (sezione nascosta: negozio nuovo) ═══
        Per ripristinare: decommentare l’import di TestimonialSection in cima al file e la riga qui sotto.

        <TestimonialSection />
      */}

      <CommercialStatsStrip />

      <PrezziPacchettiSection breathingPersonalizedMessage={data?.personalizedMessage ?? null} />

      <PrenotazioneSection />

      <section id="chi-siamo" className="mx-auto max-w-3xl scroll-mt-24 border-t border-cave-charcoal/40 px-5 py-24 lg:px-8">
        <ScrollReveal>
          <h2 className="animate-weight-section type-display-section text-salt-warm">Chi siamo</h2>
        </ScrollReveal>
        <ScrollReveal className="mt-4">
          <p className="text-sm text-text-secondary">La nostra grotta di sale — identità e storia del centro.</p>
        </ScrollReveal>
      </section>
    </main>
  )
}
