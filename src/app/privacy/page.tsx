import type { Metadata } from 'next'
import { SiteShell } from '@/components/SiteShell'
import { BUSINESS } from '@/lib/site-config'
import { SITE_GRID_WRAP } from '@/lib/page-layout'

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: `Informativa sul trattamento dei dati personali di ${BUSINESS.name}.`,
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <SiteShell>
      <article
        className={`${SITE_GRID_WRAP} bg-transparent pb-28 pt-24 font-sans text-text-secondary md:pt-28 lg:pb-16`}
      >
        <h1 className="type-display-section text-salt-warm">Privacy policy</h1>
        <p className="mt-2 text-sm text-text-muted">Ultimo aggiornamento: {new Date().getFullYear()}</p>

        <div className="mt-12 space-y-8 text-sm leading-relaxed md:text-base">
          <section className="space-y-3">
            <h2 className="font-sans text-base font-medium text-text-primary">Titolare del trattamento</h2>
            <p>
              Il titolare del trattamento dei dati è {BUSINESS.name}, con sede in {BUSINESS.streetAddress},{' '}
              {BUSINESS.postalCode} {BUSINESS.addressLocality} — P.IVA {BUSINESS.piva}. Contatti:{' '}
              <a className="text-salt-pink underline-offset-2 hover:underline" href={`mailto:${BUSINESS.email}`}>
                {BUSINESS.email}
              </a>
              , telefono {BUSINESS.telephone}.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-sans text-base font-medium text-text-primary">Dati trattati</h2>
            <p>
              Trattiamo i dati che ci fornisci volontariamente (es. nome, email, telefono, messaggi di prenotazione) e i
              dati tecnici necessari al funzionamento del sito (es. log di sistema, indirizzo IP in forma abbreviata dove
              applicabile).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-sans text-base font-medium text-text-primary">Finalità e base giuridica</h2>
            <p>
              I dati sono usati per rispondere alle richieste, gestire le prenotazioni, adempiere a obblighi di legge e, con
              il tuo consenso ove richiesto, per comunicazioni informative sul servizio. La base giuridica è l’esecuzione di
              misure precontrattuali/contrattuali, l’obbligo legale o il consenso.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-sans text-base font-medium text-text-primary">Conservazione</h2>
            <p>
              I dati sono conservati per il tempo necessario alle finalità indicate e in ottemperanza a obblighi contabili e
              fiscali.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-sans text-base font-medium text-text-primary">Diritti dell’interessato</h2>
            <p>
              Puoi esercitare i diritti previsti dagli artt. 15–22 GDPR (accesso, rettifica, cancellazione, limitazione,
              portabilità, opposizione) scrivendo al titolare agli indirizzi sopra. Hai il diritto di proporre reclamo al
              Garante per la protezione dei dati personali (www.garanteprivacy.it).
            </p>
          </section>
        </div>
      </article>
    </SiteShell>
  )
}
