import type { Metadata } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'
import { AtmosphereRoot } from '@/components/AtmosphereRoot'
import { JsonLdScripts } from '@/components/JsonLd'
import { SaltLoaderGate } from '@/components/SaltLoaderGate'
import { BreathingDataProvider } from '@/providers/BreathingDataProvider'
import { SmoothScrollProvider } from '@/providers/SmoothScrollProvider'
import { BUSINESS, SITE_NAME } from '@/lib/site-config'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

/**
 * Latin only (no latin-ext): subset più leggero del variable font.
 * `preload: true` fa sì che Next inietti nel documento `<link rel="preload" as="font" type="font/woff2" crossorigin>`.
 */
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: 'variable',
  style: ['normal', 'italic'],
  axes: ['WONK', 'SOFT', 'opsz'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
  /** Evita doppio preload critico: priorità al display (Fraunces). */
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: BUSINESS.description,
  applicationName: SITE_NAME,
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
    languages: {
      'it-IT': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: '/',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: BUSINESS.description,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Grotta di Sale Roma',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: BUSINESS.description,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        <JsonLdScripts />
        <SaltLoaderGate />
        <BreathingDataProvider>
          <SmoothScrollProvider>
            <AtmosphereRoot>{children}</AtmosphereRoot>
          </SmoothScrollProvider>
        </BreathingDataProvider>
      </body>
    </html>
  )
}
