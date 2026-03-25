import { ATMOSPHERE_COLORS } from './atmosphereTypes'

export type WarmLight = {
  nx: number
  ny: number
  radiusBase: number
  freqHz: number
  phase: number
  pink: boolean
  /** true = “lontana”, meno parallax */
  deep: boolean
}

const N_LIGHTS = 6

export function createWarmLights(seed = 0.31): WarmLight[] {
  let s = seed
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  const lights: WarmLight[] = []
  for (let i = 0; i < N_LIGHTS; i++) {
    lights.push({
      nx: 0.08 + rnd() * 0.84,
      ny: 0.1 + rnd() * 0.8,
      radiusBase: 140 + rnd() * 80,
      freqHz: 0.15 + rnd() * 0.15,
      phase: rnd() * Math.PI * 2,
      pink: rnd() > 0.48,
      deep: rnd() > 0.42,
    })
  }
  return lights
}

export function drawWarmLight(
  ctx: CanvasRenderingContext2D,
  L: WarmLight,
  tSec: number,
  w: number,
  h: number,
  ox: number,
  oy: number,
): void {
  const pulse = Math.sin(tSec * (2 * Math.PI * L.freqHz) + L.phase) * 0.35 + 0.65
  const radius = L.radiusBase * (0.92 + pulse * 0.14)
  const parallaxX = L.deep ? ox * 22 : ox * 56
  const parallaxY = L.deep ? oy * 16 : oy * 42
  const cx = L.nx * w + parallaxX
  const cy = L.ny * h + parallaxY
  const color = L.pink ? ATMOSPHERE_COLORS.saltPink : ATMOSPHERE_COLORS.saltAmber
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  const peakOpacity = 0.03 + pulse * 0.04
  const g0 = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
  g0.addColorStop(0, `rgba(${r},${g},${b},${peakOpacity})`)
  g0.addColorStop(0.45, `rgba(${r},${g},${b},${peakOpacity * 0.35})`)
  g0.addColorStop(1, `rgba(${r},${g},${b},0)`)
  ctx.fillStyle = g0
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fill()
}
