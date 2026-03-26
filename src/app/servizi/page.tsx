import type { Metadata } from 'next'
import { PrezziPacchettiSection } from '@/components/PrezziPacchettiSection'
import { SiteShell } from '@/components/SiteShell'
import { SITE_GRID_WRAP } from '@/lib/page-layout'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

export const metadata: Metadata = {
  title: 'Servizi e prezzi',
  description:
    'Prezzi haloterapia Roma: seduta singola, percorso da 10 sedute e grotta privata. Pacchetti, benefici inclusi e come prenotare.',
  alternates: { canonical: '/servizi' },
}

export default function ServiziPage() {
  return (
    <SiteShell>
      <main className="bg-transparent pb-28 font-sans lg:pb-16">
        <section className={`${SITE_GRID_WRAP} border-b border-cave-charcoal/40 pb-10 pt-24 md:pb-14 md:pt-28`}>
          <ScrollReveal>
            <h1 className="animate-weight-section type-display-section text-salt-warm">Servizi e prezzi</h1>
          </ScrollReveal>
          <ScrollReveal className="mt-4">
            <p className="max-w-2xl text-base font-normal leading-relaxed text-text-secondary md:text-lg">
              Sedute da 45 minuti nella grotta di sale terapeutica, con copriscarpe e telo inclusi. Scegli il pacchetto adatto
              a te e passa alla prenotazione in un click.
            </p>
          </ScrollReveal>
        </section>
        <PrezziPacchettiSection breathingPersonalizedMessage={null} />
      </main>
    </SiteShell>
  )
}
