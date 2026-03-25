/** t ∈ [0,1] */
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

export const easeInQuad = (t: number) => t * t

export const easeStandard = (t: number) => {
  if (t < 0.5) return 2 * t * t
  return 1 - Math.pow(-2 * t + 2, 2) / 2
}

/** Cubic bezier P0(0,0), P3(1,1), P1(0.16,1), P2(0.3,1) — usata come easing "entrate" */
export function easeOutExpoBezier(t: number): number {
  const tClamped = Math.min(1, Math.max(0, t))
  let lo = 0
  let hi = 1
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2
    const x = cubicBezierComponent(mid, 0, 0.16, 0.3, 1)
    if (x < tClamped) lo = mid
    else hi = mid
  }
  const u = (lo + hi) / 2
  return cubicBezierComponent(u, 0, 1, 1, 1)
}

function cubicBezierComponent(t: number, a: number, b: number, c: number, d: number): number {
  const u = 1 - t
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
}

/** cubic-bezier(0.4, 0, 0.2, 1) — uscite modale */
export function easeStandardBezier(t: number): number {
  const tClamped = Math.min(1, Math.max(0, t))
  let lo = 0
  let hi = 1
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2
    const x = cubicBezierComponent(mid, 0, 0.4, 0.2, 1)
    if (x < tClamped) lo = mid
    else hi = mid
  }
  const u = (lo + hi) / 2
  return cubicBezierComponent(u, 0, 0, 1, 1)
}

export function mapRange(v: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  const t = (v - inMin) / (inMax - inMin)
  const c = Math.min(1, Math.max(0, t))
  return outMin + c * (outMax - outMin)
}
