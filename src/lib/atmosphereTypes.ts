export type AtmospherePhase = 'idle' | 'active' | 'settling' | 'dissolving'

export interface AtmosphereState {
  breathAmplitude: number
  phase: AtmospherePhase
  /** 0–1 durante settling (opzionale, per attenuare il glow centrale). */
  settlingBlend: number
}

export const ATMOSPHERE_COLORS = {
  base: '#0A0A08',
  baseDissolve: '#1A1812',
  saltPink: '#D4967A',
  saltAmber: '#C8874F',
  glowLight: '#F0D4B8',
  warmGray: '#2C2A24',
} as const

export const DEFAULT_ATMOSPHERE_STATE: AtmosphereState = {
  breathAmplitude: 0,
  phase: 'idle',
  settlingBlend: 0,
}
