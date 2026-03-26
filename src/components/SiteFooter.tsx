'use client'

import { useId, useLayoutEffect, useRef, useState } from 'react'
import { gsap, initGsapPlugins } from '@/lib/gsap-init'
import { FOOTER_FAQ_ITEMS } from '@/lib/footer-faq'
import { BUSINESS, SOCIAL, googleMapsUrl } from '@/lib/site-config'
import { getWhatsAppDigits } from '@/lib/whatsappBooking'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const NAV_LINKS = [
  { href: '#esperienza', label: "L'esperienza" },
  { href: '#benefici', label: 'Benefici' },
  { href: '#prezzi', label: 'Prezzi' },
  { href: '#prenotazione', label: 'Prenota' },
  { href: '#chi-siamo', label: 'Chi siamo' },
] as const

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.2l-.35 3H15v7A10 10 0 0 0 22 12z" />
    </svg>
  )
}

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function FaqAccordionItem({ question, answer }: { question: string; answer: string }) {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)
  const first = useRef(true)
  const wrapRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLSpanElement>(null)
  const uid = useId().replace(/:/g, '')
  const panelId = `faq-panel-${uid}`
  const btnId = `faq-btn-${uid}`

  useLayoutEffect(() => {
    initGsapPlugins()
    const wrap = wrapRef.current
    const inner = innerRef.current
    const icon = iconRef.current
    if (!wrap || !inner || !icon) return

    const dur = reduced ? 0.01 : 0.4
    const ease = 'power2.out'

    if (first.current) {
      first.current = false
      gsap.set(wrap, { height: 0, overflow: 'hidden' })
      gsap.set(icon, { rotation: 0 })
      return
    }

    const h = inner.scrollHeight

    if (open) {
      gsap.fromTo(wrap, { height: 0 }, {
        height: h,
        duration: dur,
        ease,
        onComplete: () => {
          gsap.set(wrap, { height: 'auto' })
        },
      })
      gsap.to(icon, { rotation: 45, duration: dur, ease })
    } else {
      gsap.set(wrap, { height: h })
      gsap.to(wrap, { height: 0, duration: dur, ease })
      gsap.to(icon, { rotation: 0, duration: dur, ease })
    }
  }, [open, reduced])

  return (
    <div className="border-b border-cave-charcoal last:border-b-0">
      <button
        type="button"
        id={btnId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-3 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-salt-pink focus-visible:ring-offset-2 focus-visible:ring-offset-cave-dark"
      >
        <span className="font-sans text-sm font-normal text-text-primary">{question}</span>
        <span
          ref={iconRef}
          className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center font-sans text-lg leading-none text-salt-pink"
          aria-hidden
        >
          +
        </span>
      </button>
      <div ref={wrapRef} id={panelId} role="region" aria-labelledby={btnId} className="overflow-hidden">
        <div ref={innerRef} className="pb-3 pr-8">
          <p className="font-sans text-sm font-normal leading-relaxed text-text-secondary">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export function SiteFooter() {
  const wa = getWhatsAppDigits()
  const waHref = `https://wa.me/${wa}`

  return (
    <footer className="border-t border-cave-charcoal bg-cave-dark">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-20 lg:px-8 lg:py-[80px]">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* Brand */}
          <div>
            <p className="type-label-uppercase text-salt-warm">GROTTA DI SALE</p>
            <p className="mt-3 max-w-xs font-sans text-sm font-normal leading-relaxed text-text-secondary">
              Il tuo rifugio di sale nel cuore di Roma
            </p>
            <div className="mt-6 flex items-center gap-5">
              <a
                href={SOCIAL.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted transition-colors duration-200 hover:text-salt-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salt-pink focus-visible:ring-offset-2 focus-visible:ring-offset-cave-dark"
                aria-label="Instagram"
              >
                <IconInstagram />
              </a>
              <a
                href={SOCIAL.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted transition-colors duration-200 hover:text-salt-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salt-pink focus-visible:ring-offset-2 focus-visible:ring-offset-cave-dark"
                aria-label="Facebook"
              >
                <IconFacebook />
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted transition-colors duration-200 hover:text-salt-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salt-pink focus-visible:ring-offset-2 focus-visible:ring-offset-cave-dark"
                aria-label="WhatsApp"
              >
                <IconWhatsApp />
              </a>
            </div>
          </div>

          {/* Nav */}
          <nav aria-label="Esplora il sito">
            <p className="font-sans text-sm font-medium text-text-primary">Esplora</p>
            <ul className="mt-4 flex flex-col gap-3">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={
                      item.href === '#prenotazione'
                        ? 'cta-focus-visible font-sans text-sm font-normal text-text-secondary transition-colors duration-200 hover:text-salt-pink'
                        : 'font-sans text-sm font-normal text-text-secondary transition-colors duration-200 hover:text-salt-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salt-pink focus-visible:ring-offset-2 focus-visible:ring-offset-cave-dark'
                    }
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Info */}
          <div>
            <p className="font-sans text-sm font-medium text-text-primary">Info</p>
            <address className="mt-4 not-italic">
              <p className="font-sans text-sm font-normal leading-relaxed text-text-secondary">
                <a
                  href={googleMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-cave-charcoal underline-offset-2 transition-colors hover:text-salt-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salt-pink"
                >
                  {BUSINESS.streetAddress}
                  <br />
                  {BUSINESS.postalCode} {BUSINESS.addressLocality}
                </a>
              </p>
              <p className="mt-3">
                <a
                  href={`tel:${BUSINESS.telephone.replace(/\s/g, '')}`}
                  className="font-sans text-sm font-normal text-text-secondary transition-colors hover:text-salt-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salt-pink"
                >
                  {BUSINESS.telephone}
                </a>
              </p>
              <p className="mt-3 font-sans text-sm font-normal text-text-secondary">Lun-Sab 10:00-20:00</p>
              <p className="mt-3">
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="font-sans text-sm font-normal text-text-secondary transition-colors hover:text-salt-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salt-pink"
                >
                  {BUSINESS.email}
                </a>
              </p>
            </address>
          </div>

          {/* FAQ */}
          <div>
            <p className="font-sans text-sm font-medium text-text-primary">Domande rapide</p>
            <div className="mt-2">
              {FOOTER_FAQ_ITEMS.map((item) => (
                <FaqAccordionItem key={item.question} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        </div>

        <p className="mt-14 border-t border-cave-charcoal/60 pt-8 text-center font-sans text-xs font-normal text-text-muted">
          © {new Date().getFullYear()} Grotta di Sale Roma. P.IVA {BUSINESS.piva}
        </p>
      </div>
    </footer>
  )
}
