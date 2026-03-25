export const RING_POINT_COUNT = 192

export type RingPoint = { x: number; y: number }

type Noise3 = (x: number, y: number, z: number) => number

/**
 * Displacement idle: noise3D(cos(a)*1.5, sin(a)*1.5, t*0.15) * amp
 */
export function idleDisplacement(noise3D: Noise3, angle: number, tSec: number, amp: number): number {
  const c = Math.cos(angle) * 1.5
  const s = Math.sin(angle) * 1.5
  return noise3D(c, s, tSec * 0.15) * amp
}

/**
 * Ondulazione lungo l’anello: armoniche più fitte + velocità tempo maggiore.
 * `drive` (0–1, tipicamente visualLevel) accentua le increspature alte e la cinetica.
 */
export function breathWaveshape(angle: number, tSec: number, drive = 1): number {
  const d = Math.max(0, Math.min(1, drive))
  const speed = 0.85 + d * 1.35
  const hi = 0.45 + d * 0.75
  const sum =
    Math.sin(angle * 8 - tSec * 2.8 * speed) * 0.34 * hi +
    Math.sin(angle * 13 - tSec * 2.1 * speed) * 0.26 * hi +
    Math.sin(angle * 5 - tSec * 1.65 * speed) * 0.22 * hi +
    Math.sin(angle * 19 - tSec * 3.6 * speed) * 0.16 * hi +
    Math.sin(angle * 3 + tSec * 1.15 * speed) * 0.14 +
    Math.sin(angle * 24 - tSec * 4.2 * speed) * 0.1 * hi
  /* Molte armoniche sommano: scala per non esplodere in px con waveAmp alto. */
  return sum * 0.8
}

/** Costruisce path chiuso con quadraticCurveTo; controllo = punto polare a θ medio */
export function buildRingPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseR: number,
  displacements: Float32Array,
  startAtTop = true,
): void {
  const N = displacements.length
  const points: RingPoint[] = new Array(N)
  const angles: number[] = new Array(N)
  const offset = startAtTop ? -Math.PI / 2 : 0
  for (let i = 0; i < N; i++) {
    const angle = (2 * Math.PI * i) / N + offset
    angles[i] = angle
    const r = baseR + displacements[i]
    points[i] = { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r }
  }

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 0; i < N; i++) {
    const next = points[(i + 1) % N]
    let a0 = angles[i]
    let a1 = angles[(i + 1) % N]
    if (a1 < a0) a1 += 2 * Math.PI
    const aMid = (a0 + a1) / 2
    const rMid = baseR + (displacements[i] + displacements[(i + 1) % N]) / 2
    const cpx = cx + Math.cos(aMid) * rMid
    const cpy = cy + Math.sin(aMid) * rMid
    ctx.quadraticCurveTo(cpx, cpy, next.x, next.y)
  }
  ctx.closePath()
}
