import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/SiteShell'
import { BUSINESS, SOCIAL, googleMapsUrl } from '@/lib/site-config'
import { getWhatsAppDigits } from '@/lib/whatsappBooking'
import { SITE_GRID_WRAP } from '@/lib/page-layout'
import { routes } from '@/lib/routes'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

export const metadata: Metadata = {
  title: 'Contatti',
  description:
    'Contatta Grotta di Sale Roma: indirizzo, orari, telefono, email e profili social. Vieni a trovarci nel centro.',
  alternates: { canonical: '/contatti' },
}

export default function ContattiPage() {
  const wa = getWhatsAppDigits()
  const waHref = `https://wa.me/${wa}`

  return (
    <SiteShell>
      <main className={`${SITE_GRID_WRAP} bg-transparent pb-28 pt-24 font-sans md:pt-28 lg:pb-16`}>
        <ScrollReveal>
          <h1 className="animate-weight-section type-display-section text-salt-warm">Contatti</h1>
        </ScrollReveal>
        <ScrollReveal className="mt-6">
          <p className="max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
            Siamo nel cuore di Roma. Scrivici su WhatsApp, passa in negozio negli orari indicati o prenota direttamente dalla{' '}
            <Link href={routes.prenota} className="text-salt-pink underline-offset-4 transition-colors hover:underline">
              pagina prenotazioni
            </Link>
            .
          </p>
        </ScrollReveal>

        <address className="mt-14 max-w-xl space-y-8 not-italic">
          <div>
            <p className="type-label-uppercase text-text-muted">Indirizzo</p>
            <a
              href={googleMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block font-sans text-lg font-normal text-text-primary underline decoration-cave-charcoal underline-offset-4 transition-colors hover:text-salt-pink"
            >
              {BUSINESS.streetAddress}
              <br />
              {BUSINESS.postalCode} {BUSINESS.addressLocality}
            </a>
          </div>
          <div>
            <p className="type-label-uppercase text-text-muted">Orari</p>
            <p className="mt-2 font-sans text-base text-text-primary">Lun–sab, 10:00–20:00</p>
          </div>
          <div>
            <p className="type-label-uppercase text-text-muted">Telefono</p>
            <a
              href={`tel:${BUSINESS.telephone.replace(/\s/g, '')}`}
              className="mt-2 block font-sans text-lg text-text-primary transition-colors hover:text-salt-pink"
            >
              {BUSINESS.telephone}
            </a>
          </div>
          <div>
            <p className="type-label-uppercase text-text-muted">Email</p>
            <a
              href={`mailto:${BUSINESS.email}`}
              className="mt-2 block font-sans text-lg text-text-primary transition-colors hover:text-salt-pink"
            >
              {BUSINESS.email}
            </a>
          </div>
          <div>
            <p className="type-label-uppercase text-text-muted">WhatsApp</p>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-sans text-lg text-salt-pink transition-opacity hover:opacity-90"
            >
              Scrivici su WhatsApp
            </a>
          </div>
          <div>
            <p className="type-label-uppercase text-text-muted">Social</p>
            <div className="mt-3 flex gap-6 font-sans text-sm">
              <a
                href={SOCIAL.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary transition-colors hover:text-salt-pink"
              >
                Instagram
              </a>
              <a
                href={SOCIAL.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary transition-colors hover:text-salt-pink"
              >
                Facebook
              </a>
            </div>
          </div>
        </address>
      </main>
    </SiteShell>
  )
}
