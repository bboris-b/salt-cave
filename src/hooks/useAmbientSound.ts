import { useCallback, useEffect, useRef } from 'react'

/**
 * Drone morbido + shimmer leggero (no file audio — Web Audio).
 */
export function useAmbientSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const oscRefs = useRef<OscillatorNode[]>([])

  const teardown = useCallback(() => {
    oscRefs.current.forEach((o) => {
      try {
        o.stop()
      } catch {
        /* already stopped */
      }
    })
    oscRefs.current = []
    void ctxRef.current?.close()
    ctxRef.current = null
    gainRef.current = null
  }, [])

  useEffect(() => {
    if (!enabled) {
      teardown()
      return
    }

    const ctx = new AudioContext()
    ctxRef.current = ctx
    void ctx.resume()
    const master = ctx.createGain()
    master.gain.value = 0.0001
    master.connect(ctx.destination)
    gainRef.current = master

    const osc1 = ctx.createOscillator()
    osc1.type = 'sine'
    osc1.frequency.value = 58
    const g1 = ctx.createGain()
    g1.gain.value = 0.045
    osc1.connect(g1)
    g1.connect(master)

    const osc2 = ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.value = 116.5
    const g2 = ctx.createGain()
    g2.gain.value = 0.018
    osc2.connect(g2)
    g2.connect(master)

    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.09
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 2.5
    lfo.connect(lfoGain)
    lfoGain.connect(osc1.frequency)

    osc1.start()
    osc2.start()
    lfo.start()

    oscRefs.current = [osc1, osc2, lfo]

    const now = ctx.currentTime
    master.gain.exponentialRampToValueAtTime(0.085, now + 2.2)

    return teardown
  }, [enabled, teardown])

  return { teardown }
}
