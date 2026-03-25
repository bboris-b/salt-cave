import { ATMOSPHERE_COLORS } from './atmosphereTypes'

export type SaltParticle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  wobble: number
  wobbleSpeed: number
}

export function createSaltParticles(count: number, width: number, height: number, seed = 0.73): SaltParticle[] {
  let s = seed
  const rnd = () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
  const particles: SaltParticle[] = []
  for (let i = 0; i < count; i++) {
    particles.push({
      x: rnd() * width,
      y: rnd() * height,
      vx: (rnd() - 0.5) * 0.1,
      vy: -0.05 - rnd() * 0.15,
      size: 0.5 + rnd() * 1,
      alpha: 0.03 + rnd() * 0.05,
      wobble: rnd() * Math.PI * 2,
      wobbleSpeed: 0.3 + rnd() * 0.3,
    })
  }
  return particles
}

type ParticleDrawOpts = {
  /** Offset aggiuntivo da scroll (parallax) */
  scrollOx?: number
  scrollOy?: number
  /** prefers-reduced-motion: ferma drift particelle */
  staticParticles?: boolean
}

export function updateAndDrawSaltParticles(
  ctx: CanvasRenderingContext2D,
  particles: SaltParticle[],
  tSec: number,
  width: number,
  height: number,
  ox: number,
  oy: number,
  opts?: ParticleDrawOpts,
): void {
  const r = parseInt(ATMOSPHERE_COLORS.saltPink.slice(1, 3), 16)
  const g = parseInt(ATMOSPHERE_COLORS.saltPink.slice(3, 5), 16)
  const b = parseInt(ATMOSPHERE_COLORS.saltPink.slice(5, 7), 16)
  const scrollOx = opts?.scrollOx ?? 0
  const scrollOy = opts?.scrollOy ?? 0
  const staticParticles = opts?.staticParticles ?? false
  const parallaxX = ox * 24 + scrollOx
  const parallaxY = oy * 16 + scrollOy

  for (const p of particles) {
    if (!staticParticles) {
      p.x += p.vx + Math.sin(tSec * p.wobbleSpeed + p.wobble) * 0.04
      p.y += p.vy
      if (p.y < -8) {
        p.y = height + 8
        p.x = Math.random() * width
      }
      if (p.x < -10) p.x = width + 10
      if (p.x > width + 10) p.x = -10
    }

    const drawX = p.x + parallaxX
    const drawY = p.y + parallaxY
    const flicker = Math.sin(tSec * 1.2 + p.wobble) * 0.25 + 0.75
    const a = p.alpha * flicker
    ctx.fillStyle = `rgba(${r},${g},${b},${a})`
    ctx.beginPath()
    ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2)
    ctx.fill()
  }
}
