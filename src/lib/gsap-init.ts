import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

let registered = false

export function initGsapPlugins(): void {
  if (typeof window === 'undefined' || registered) return
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
  registered = true
}

/**
 * Con Lenis, `SmoothScrollProvider` applica `scrollerProxy` su `document.documentElement`:
 * ogni ScrollTrigger deve usare questo `scroller` o resta agganciato allo scroll nativo (effetti “morti”).
 */
export function getScrollTriggerScroller(): HTMLElement {
  return document.documentElement
}

export { gsap, ScrollTrigger, ScrollToPlugin }
