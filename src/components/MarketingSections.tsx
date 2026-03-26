'use client'

import { BreathingInsightCard } from '@/components/BreathingInsightCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { PillTag } from '@/components/ui/PillTag'
import { BeneficiPinnedSection } from '@/components/BeneficiPinnedSection'
import { ScienceHero } from '@/components/ScienceHero'
import { CommercialStatsStrip } from '@/components/CommercialStatsStrip'
// Testimonial: nascosto finché il negozio non ha recensioni reali — riattivare import + JSX sotto
// import { TestimonialSection } from '@/components/TestimonialSection'
import { PrezziPacchettiSection } from '@/components/PrezziPacchettiSection'
import { PrenotazioneSection } from '@/components/PrenotazioneSection'
import { SITE_GRID_GAP, SITE_GRID_WRAP } from '@/lib/page-layout'
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

      <section id="accoglienza" className="scroll-mt-24 border-b border-cave-charcoal/40">
        <div className={`${SITE_GRID_WRAP} py-16 md:py-20 lg:py-24`}>
          <div className={`grid grid-cols-1 lg:grid-cols-12 ${SITE_GRID_GAP}`}>
            <div className={data ? 'lg:col-span-8' : 'lg:col-span-12'}>
              <ScrollReveal>
                <PillTag>L&apos;esperienza</PillTag>
              </ScrollReveal>
              <p className="mt-6 max-w-2xl text-base font-normal leading-[1.7] text-text-secondary md:text-lg md:leading-relaxed">
                Ogni seduta è tempo solo per te. Qui sotto trovi come la grotta sostiene benessere e respiro — senza
                sostituire il parere del medico.
              </p>
            </div>
            {data ? (
              <div className="lg:col-span-4">
                <BreathingInsightCard data={data} className="h-full lg:sticky lg:top-28" />
              </div>
            ) : null}
          </div>
        </div>
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

      <section id="chi-siamo" className="scroll-mt-24 border-t border-cave-charcoal/40">
        <div className={`${SITE_GRID_WRAP} py-24`}>
          <ScrollReveal>
            <h2 className="animate-weight-section type-display-section text-salt-warm">Chi siamo</h2>
          </ScrollReveal>
          <ScrollReveal className="mt-4">
            <p className="text-sm text-text-secondary">La nostra grotta di sale — identità e storia del centro.</p>
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}
