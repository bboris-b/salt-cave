import type { Metadata } from 'next'
import { BeneficiPinnedSection } from '@/components/BeneficiPinnedSection'
import { ScienceHero } from '@/components/ScienceHero'
import { SiteShell } from '@/components/SiteShell'
import { routes } from '@/lib/routes'

export const metadata: Metadata = {
  title: "L'haloterapia",
  description:
    'Haloterapia e grotta di sale a Roma: benefici per vie respiratorie, pelle e stress. Come funziona il microclima salino terapeutico nel centro.',
  alternates: { canonical: '/haloterapia' },
}

export default function HaloterapiaPage() {
  return (
    <SiteShell>
      <main className="bg-transparent pb-28 font-sans lg:pb-16">
        <ScienceHero
          sectionId="haloterapia"
          title="L'haloterapia nella grotta di sale"
          subtitle="Microclima salino controllato: particelle finissime nell’aria che accompagnano respiro e pelle. A Roma, nella nostra grotta terapeutica, 45 minuti possono fare la differenza per naso, bronchie, dermatiti e tensione nervosa — con protocolli ispirati alle sale naturali."
          ctaHref={routes.prenota}
          ctaLabel="Prenota una seduta"
        />
        <BeneficiPinnedSection />
      </main>
    </SiteShell>
  )
}
