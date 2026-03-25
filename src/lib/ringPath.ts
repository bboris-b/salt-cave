export const RING_POINT_COUNT = 192

export type RingPoint = { x: number; y: number }

type Noise3 = (x: number, y: number, z: number) => number

/**
 * Displacement idle: noise3D(cos(a)*1.5, sin(a)*1.5, t*0.15) * amp
 */
export function idleDisplacement(noise3D: Noise3, angle: number, tSec: number, amp: number): number {
  const c = Math.cos(angle) * 1.5
  const s = Math.sin(angle) * 1.5
  return noise3D(c, s, tSec * 0.1) * amp
}

/**
 * Ondulazione morbida lungo l’anello — poche armoniche basse, tempo da “respiro lento”.
 * `drive` modula leggermente ampiezza e velocità senza introdurre frequenze nervose.
 */
export function breathWaveshape(angle: number, tSec: number, drive = 1): number {
  const d = Math.max(0, Math.min(1, drive))
  const speed = 0.42 + d * 0.35
  const amp = 0.72 + d * 0.22
  const sum =
    Math.sin(angle * 3 - tSec * 0.52 * speed) * 0.58 * amp +
    Math.sin(angle * 5 - tSec * 0.36 * speed) * 0.28 * amp +
    Math.sin(angle * 2 + tSec * 0.22 * speed) * 0.14 * amp
  return sum * 0.92
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
