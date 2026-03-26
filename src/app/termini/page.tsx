import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/SiteShell'
import { BUSINESS } from '@/lib/site-config'
import { SITE_GRID_WRAP } from '@/lib/page-layout'
import { routes } from '@/lib/routes'

export const metadata: Metadata = {
  title: 'Termini e condizioni',
  description: `Condizioni generali di utilizzo del sito e del servizio ${BUSINESS.name}.`,
  alternates: { canonical: '/termini' },
  robots: { index: true, follow: true },
}

export default function TerminiPage() {
  return (
    <SiteShell>
      <article
        className={`${SITE_GRID_WRAP} bg-transparent pb-28 pt-24 font-sans text-text-secondary md:pt-28 lg:pb-16`}
      >
        <h1 className="type-display-section text-salt-warm">Termini e condizioni</h1>
        <p className="mt-2 text-sm text-text-muted">Ultimo aggiornamento: {new Date().getFullYear()}</p>

        <div className="mt-12 space-y-8 text-sm leading-relaxed md:text-base">
          <section className="space-y-3">
            <h2 className="font-sans text-base font-medium text-text-primary">Accettazione</h2>
            <p>
              L’utilizzo del sito {BUSINESS.name} implica l’accettazione delle presenti condizioni. Se non le accetti, ti
              preghiamo di non utilizzare il sito.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-sans text-base font-medium text-text-primary">Servizio</h2>
            <p>
              Le informazioni sul sito hanno scopo generale e non sostituiscono il parere medico. Le sedute in grotta di
              sale sono un servizio di benessere; in caso di patologie consulta sempre il tuo medico.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-sans text-base font-medium text-text-primary">Prenotazioni e pagamenti</h2>
            <p>
              Le prenotazioni sono soggette a conferma. Le condizioni di annullamento, pagamento e eventuali penali sono
              comunicate al momento della prenotazione o in sede. Ci riserviamo di rifiutare il servizio in caso di
              comportamenti incompatibili con la sicurezza degli spazi comuni.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-sans text-base font-medium text-text-primary">Proprietà intellettuale</h2>
            <p>
              Testi, marchi, grafica e contenuti del sito sono di proprietà del titolare o dei rispettivi licenzianti, salvo
              diversa indicazione.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-sans text-base font-medium text-text-primary">Legge applicabile</h2>
            <p>
              Per le controversie si applica la legge italiana. Foro competente, ove consentito, quello di{' '}
              {BUSINESS.addressLocality}.
            </p>
          </section>

          <p className="text-text-muted">
            <Link href={routes.privacy} className="text-salt-pink underline-offset-2 hover:underline">
              Privacy policy
            </Link>
          </p>
        </div>
      </article>
    </SiteShell>
  )
}
