export const RING_POINT_COUNT = 192

export type RingPoint = { x: number; y: number }

type Noise3 = (x: number, y: number, z: number) => number

/**
 * Displacement idle: noise3D(cos(a)*1.5, sin(a)*1.5, t*0.135) * amp
 */
export function idleDisplacement(noise3D: Noise3, angle: number, tSec: number, amp: number): number {
  const c = Math.cos(angle) * 1.5
  const s = Math.sin(angle) * 1.5
  return noise3D(c, s, tSec * 0.135) * amp
}

/**
 * Onda “Perplexity-like”: poche armoniche basse che viaggiano in fase lungo l’anello,
 * movimento omogeneo senza increspature ad alta frequenza.
 */
export function breathWaveshape(angle: number, tSec: number, drive = 1): number {
  const d = Math.max(0, Math.min(1, drive))
  const speed = 0.46 + d * 0.36
  const amp = 0.88 + d * 0.16
  const ph = tSec * speed
  const sum =
    Math.sin(angle * 2 - ph * 0.58) * 0.44 * amp +
    Math.sin(angle * 3 - ph * 0.52) * 0.36 * amp +
    Math.sin(angle * 4 + ph * 0.26) * 0.12 * amp +
    Math.sin(angle * 5 - ph * 0.38) * 0.1 * amp
  return sum * 0.94
}

/**
 * Increspatura che si propaga lungo il perimetro (solo modi azimutali in fase con il tempo).
 * Evita offset radiali uniformi che fanno “traballare” tutto l’anello sul volume.
 */
export function travelingRipple(angle: number, tSec: number, strength: number, drive = 1): number {
  const s = Math.max(0, Math.min(1, strength))
  if (s < 0.004) return 0
  const d = Math.max(0, Math.min(1, drive))
  const spd = 0.95 + d * 0.75
  const ph = tSec * spd
  const w =
    Math.sin(angle * 3 - ph * 1.05) * 0.5 +
    Math.sin(angle * 5 - ph * 0.92) * 0.32 +
    Math.sin(angle * 7 + ph * 0.35) * 0.18
  return w * s * 1.02
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
