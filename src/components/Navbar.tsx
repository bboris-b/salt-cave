'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { gsap, initGsapPlugins } from '@/lib/gsap-init'
import { useSmoothScroll } from '@/providers/SmoothScrollContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Button } from '@/components/ui/Button'

const LINKS = [
  { href: '#esperienza', label: "L'esperienza" },
  { href: '#benefici', label: 'Benefici' },
  { href: '#testimonianze', label: 'Chi ci ha scelto' },
  { href: '#prezzi', label: 'Prezzi' },
  { href: '#prenotazione', label: 'Prenota' },
  { href: '#chi-siamo', label: 'Chi siamo' },
] as const

export function Navbar() {
  const smooth = useSmoothScroll()
  const reduced = usePrefersReducedMotion()
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const line1 = useRef<HTMLSpanElement>(null)
  const line2 = useRef<HTMLSpanElement>(null)
  const line3 = useRef<HTMLSpanElement>(null)
  const menuPanel = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([])

  const scroll = smooth?.scroll ?? 0

  useEffect(() => {
    setSolid(scroll > 60)
  }, [scroll])

  useEffect(() => {
    if (reduced) {
      if (open) {
        const panel = menuPanel.current
        if (panel) {
          panel.style.opacity = '1'
          panel.style.visibility = 'visible'
          panel.style.pointerEvents = 'auto'
        }
      } else {
        const panel = menuPanel.current
        if (panel) {
          panel.style.opacity = '0'
          panel.style.visibility = 'hidden'
          panel.style.pointerEvents = 'none'
        }
      }
      return
    }

    initGsapPlugins()
    const l1 = line1.current
    const l2 = line2.current
    const l3 = line3.current
    const panel = menuPanel.current
    if (!l1 || !l2 || !l3 || !panel) return

    const dur = 0.3
    const ease = 'power2.inOut'

    if (open) {
      gsap.set(panel, { autoAlpha: 1, pointerEvents: 'auto' })
      gsap.to(l1, { rotate: 45, y: 8, duration: dur, ease })
      gsap.to(l2, { autoAlpha: 0, duration: dur * 0.6, ease })
      gsap.to(l3, { rotate: -45, y: -8, duration: dur, ease })
      const items = itemsRef.current.filter(Boolean)
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.08,
          ease: 'power2.out',
          delay: 0.05,
        },
      )
    } else {
      gsap.to(l1, { rotate: 0, y: 0, duration: dur, ease })
      gsap.to(l2, { autoAlpha: 1, duration: dur, ease })
      gsap.to(l3, { rotate: 0, y: 0, duration: dur, ease })
      gsap.to(panel, {
        autoAlpha: 0,
        pointerEvents: 'none',
        duration: 0.25,
        ease,
      })
    }
  }, [open, reduced])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const barStyle = solid
    ? {
        backgroundColor: 'rgba(10, 10, 8, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--cave-charcoal)',
      }
    : {
        backgroundColor: 'transparent',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        borderBottom: '1px solid transparent',
      }

  return (
    <header
      className="fixed left-0 right-0 top-0 z-[100] transition-[background-color,border-color,backdrop-filter] duration-[400ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
      style={barStyle}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-5 lg:px-8">
        <Link
          href="/"
          className="shrink-0 font-display text-sm font-normal uppercase tracking-[0.08em] text-salt-warm md:text-base"
        >
          Grotta di Sale
        </Link>

        <nav className="hidden flex-1 justify-center lg:flex" aria-label="Principale">
          <ul className="flex items-center gap-10">
            {LINKS.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="nav-link font-sans text-sm font-normal text-text-primary">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden shrink-0 lg:block">
          <Button type="button" variant="solid" className="!px-7 !py-2.5 !text-sm">
            Prenota ora
          </Button>
        </div>

        <button
          type="button"
          className="relative z-[110] flex h-11 w-11 flex-col items-center justify-center gap-1.5 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Chiudi menu' : 'Apri menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <span ref={line1} className="block h-0.5 w-6 origin-center rounded-full bg-text-primary" />
          <span ref={line2} className="block h-0.5 w-6 rounded-full bg-text-primary" />
          <span ref={line3} className="block h-0.5 w-6 origin-center rounded-full bg-text-primary" />
        </button>
      </div>

      <div
        id="mobile-menu"
        ref={menuPanel}
        className="fixed inset-0 top-0 z-[105] flex flex-col items-center justify-center bg-[var(--cave-black)] px-8 lg:hidden"
        style={{ opacity: 0, visibility: 'hidden', pointerEvents: 'none' }}
        aria-hidden={!open}
      >
        <nav className="flex flex-col items-center gap-8" aria-label="Mobile">
          {LINKS.map((item, i) => (
            <a
              key={item.href}
              ref={(el) => {
                itemsRef.current[i] = el
              }}
              href={item.href}
              className="font-sans text-lg font-normal text-text-primary"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <Button type="button" variant="solid" className="mt-4 !px-10" onClick={() => setOpen(false)}>
            Prenota ora
          </Button>
        </nav>
      </div>
    </header>
  )
}
