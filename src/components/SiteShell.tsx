import type { ReactNode } from 'react'
import { Navbar } from '@/components/Navbar'
import { ScrollToTop } from '@/components/ScrollToTop'
import { SiteFooter } from '@/components/SiteFooter'
import { StickyCtaMobile } from '@/components/StickyCtaMobile'

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="relative z-[1] min-h-dvh bg-transparent pt-[4.25rem]">{children}</div>
      <SiteFooter />
      <StickyCtaMobile />
      <ScrollToTop />
    </>
  )
}
