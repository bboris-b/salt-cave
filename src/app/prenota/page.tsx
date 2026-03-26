import type { Metadata } from 'next'
import { PrenotazioneSection } from '@/components/PrenotazioneSection'
import { SiteShell } from '@/components/SiteShell'

export const metadata: Metadata = {
  title: 'Prenota',
  description:
    'Prenota la tua seduta di haloterapia a Roma: calendario, fascia oraria e messaggio WhatsApp con Grotta di Sale Roma.',
  alternates: { canonical: '/prenota' },
}

export default function PrenotaPage() {
  return (
    <SiteShell>
      <main className="bg-transparent pb-28 font-sans lg:pb-16">
        <h1 className="sr-only">Prenota la tua seduta</h1>
        <PrenotazioneSection />
      </main>
    </SiteShell>
  )
}
