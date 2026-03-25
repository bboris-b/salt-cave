'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    __saltMarkLoaderReady?: () => void
  }
}

/** Segnala al loader inline che il bundle React è montato (percentuale → 100% e poi fade). */
export function SaltLoaderReady() {
  useEffect(() => {
    window.__saltMarkLoaderReady?.()
  }, [])
  return null
}
