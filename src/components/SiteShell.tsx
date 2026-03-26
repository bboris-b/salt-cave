import type { ReactNode } from 'react'
import { AnimateWeightTitles } from '@/components/AnimateWeightTitles'
import { Navbar } from '@/components/Navbar'
import { ScrollToTop } from '@/components/ScrollToTop'
import { SiteFooter } from '@/components/SiteFooter'
import { StickyCtaMobile } from '@/components/StickyCtaMobile'

type SiteShellProps = {
  children: ReactNode
  /** Solo homepage: navbar dopo l’intro, con animazione d’ingresso. */
  navbarEntrance?: 'immediate' | 'fadeUp'
}

export function SiteShell({ children, navbarEntrance = 'immediate' }: SiteShellProps) {
  return (
    <>
      <Navbar entrance={navbarEntrance} />
      <div className="relative z-[1] min-h-dvh bg-transparent pt-[4.25rem]">
        <AnimateWeightTitles />
        {children}
      </div>
      <SiteFooter />
      <StickyCtaMobile />
      <ScrollToTop />
    </>
  )
}
