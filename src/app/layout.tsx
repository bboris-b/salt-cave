import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import { SaltLoaderReady } from '@/components/SaltLoaderReady'
import { LOADER_INLINE_CSS, LOADER_INLINE_SCRIPT } from '@/lib/salt-loader-inline'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Grotta di Sale',
  description: 'Esperienza per il respiro',
}

const LOADER_SVG_PATH =
  'M50 14 C67 14 84 22 88 38 C92 54 84 72 68 80 C52 88 32 84 22 70 C12 56 14 36 28 24 C36 16 46 14 50 14 Z'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        <style dangerouslySetInnerHTML={{ __html: LOADER_INLINE_CSS }} />
        <div id="loader">
          <div className="salt-loader-inner">
            <svg
              id="loader-ring-svg"
              viewBox="0 0 100 100"
              role="progressbar"
              aria-valuenow={0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={"Caricamento dell'esperienza"}
            >
              <path pathLength={100} d={LOADER_SVG_PATH} />
            </svg>
            <p id="loader-pct" role="status" aria-live="polite">
              0%
            </p>
          </div>
        </div>
        <script dangerouslySetInnerHTML={{ __html: LOADER_INLINE_SCRIPT }} />
        <SaltLoaderReady />
        {children}
      </body>
    </html>
  )
}
