import { createNoise3D } from 'simplex-noise'
import { meanStd } from './audioUtils'

const noise3D = createNoise3D(() => 0.42)

export type BreathCycle = {
  Ti: number
  Te: number
  Ttot: number
  timestamp: number
}

export class BreathCycleDetector {
  private inExhale = false
  private prevOnsetTime: number | null = null
  private lastTe: number | null = null
  private calibration: number[] = []
  private calibrated = false
  private threshold = 0.08
  private readonly calibWindowMs = 5000
  private cycles: BreathCycle[] = []

  reset(): void {
    this.inExhale = false
    this.prevOnsetTime = null
    this.lastTe = null
    this.calibration = []
    this.calibrated = false
    this.threshold = 0.08
    this.cycles = []
  }

  processSample(rms: number, tSec: number): void {
    if (!this.calibrated && tSec < this.calibWindowMs / 1000) {
      this.calibration.push(rms)
      return
    }
    if (!this.calibrated && tSec >= this.calibWindowMs / 1000) {
      const { mean, std } = meanStd(this.calibration)
      /* Leggermente più sensibile: il respiro al microfono è spesso sotto soglia se troppo conservativa. */
      this.threshold = Math.max(0.035, mean + 1.65 * std)
      this.calibrated = true
    }
    if (!this.calibrated) return

    const jitter = noise3D(tSec * 0.8, 0, 0) * 0.012 * this.threshold
    const thr = this.threshold + jitter
    const above = rms > thr

    if (above && !this.inExhale) {
      const now = tSec
      if (this.prevOnsetTime !== null && this.lastTe !== null) {
        const Ttot = now - this.prevOnsetTime
        const Te = this.lastTe
        const Ti = Math.max(0, Ttot - Te)
        this.cycles.push({ Ti, Te, Ttot, timestamp: now })
      }
      this.prevOnsetTime = now
      this.lastTe = null
      this.inExhale = true
    } else if (!above && this.inExhale && this.prevOnsetTime !== null) {
      this.lastTe = tSec - this.prevOnsetTime
      this.inExhale = false
    }
  }

  getCyclesRaw(): BreathCycle[] {
    return this.cycles
  }

  getProcessedCycles(): BreathCycle[] {
    const c = this.cycles
    if (c.length <= 2) return []
    return c.slice(1, -1)
  }
}

export function summarizeBreaths(cycles: BreathCycle[]): {
  rr: number
  ieRatio: number
  meanTtot: number
} | null {
  if (cycles.length === 0) return null
  const meanTtot = cycles.reduce((s, c) => s + c.Ttot, 0) / cycles.length
  const meanTi = cycles.reduce((s, c) => s + c.Ti, 0) / cycles.length
  const meanTe = cycles.reduce((s, c) => s + c.Te, 0) / cycles.length
  const rr = 60 / meanTtot
  const ieRatio = meanTe > 0.001 ? meanTi / meanTe : 1
  return { rr, ieRatio, meanTtot }
}
