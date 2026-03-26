import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/SiteShell'
import { SITE_GRID_WRAP } from '@/lib/page-layout'
import { routes } from '@/lib/routes'

export const metadata: Metadata = {
  title: 'Cookie policy',
  description: 'Informativa sui cookie utilizzati dal sito Grotta di Sale Roma.',
  alternates: { canonical: '/cookie-policy' },
  robots: { index: true, follow: true },
}

export default function CookiePolicyPage() {
  return (
    <SiteShell>
      <article
        className={`${SITE_GRID_WRAP} bg-transparent pb-28 pt-24 font-sans text-text-secondary md:pt-28 lg:pb-16`}
      >
        <h1 className="type-display-section text-salt-warm">Cookie policy</h1>
        <p className="mt-2 text-sm text-text-muted">Ultimo aggiornamento: {new Date().getFullYear()}</p>

        <div className="mt-12 space-y-8 text-sm leading-relaxed md:text-base">
          <section className="space-y-3">
            <h2 className="font-sans text-base font-medium text-text-primary">Cosa sono i cookie</h2>
            <p>
              I cookie sono piccoli file di testo che i siti visitati inviano al dispositivo dell’utente, dove vengono
              memorizzati per essere poi ritrasmessi agli stessi siti in visita successiva.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-sans text-base font-medium text-text-primary">Cookie che utilizziamo</h2>
            <p>
              Utilizziamo cookie tecnici necessari al funzionamento del sito (es. preferenze di sessione, sicurezza,
              bilanciamento del carico). Eventuali strumenti di analytics o marketing di terze parti, se attivati, saranno
              elencati qui con indicazione della finalità e della durata, e — ove richiesto — del consenso.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-sans text-base font-medium text-text-primary">Come gestire i cookie</h2>
            <p>
              Puoi bloccare o cancellare i cookie dalle impostazioni del browser. La disattivazione dei cookie tecnici può
              compromettere alcune funzioni del sito.
            </p>
          </section>

          <p className="text-text-muted">
            Per il trattamento dei dati personali vedi anche la{' '}
            <Link href={routes.privacy} className="text-salt-pink underline-offset-2 hover:underline">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </article>
    </SiteShell>
  )
}
