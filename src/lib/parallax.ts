/**
 * Mouse / deviceorientation → target normalizzato 0–1, con doppio smoothing
 * (main lento per luci e profondità, glow più morbido per alone centrale).
 */
export class ParallaxController {
  targetX = 0.5
  targetY = 0.5
  smoothX = 0.5
  smoothY = 0.5
  glowSmoothX = 0.5
  glowSmoothY = 0.5
  private readonly lerpMain = 0.025
  private readonly lerpGlow = 0.02

  setTargetFromMouse(clientX: number, clientY: number, width: number, height: number): void {
    if (width <= 0 || height <= 0) return
    this.targetX = clientX / width
    this.targetY = clientY / height
  }

  /** beta, gamma in gradi; range utile ~±15° → mappato su 0–1 */
  setTargetFromOrientation(beta: number | null, gamma: number | null): void {
    if (beta == null || gamma == null) return
    const bx = Math.min(15, Math.max(-15, beta))
    const gy = Math.min(15, Math.max(-15, gamma))
    this.targetX = 0.5 + (gy / 15) * 0.35
    this.targetY = 0.5 + (bx / 15) * 0.35
  }

  tick(): void {
    this.smoothX += (this.targetX - this.smoothX) * this.lerpMain
    this.smoothY += (this.targetY - this.smoothY) * this.lerpMain
    this.glowSmoothX += (this.targetX - this.glowSmoothX) * this.lerpGlow
    this.glowSmoothY += (this.targetY - this.glowSmoothY) * this.lerpGlow
  }

  /** -0.5 … 0.5 */
  offsetMain(): { ox: number; oy: number } {
    return { ox: this.smoothX - 0.5, oy: this.smoothY - 0.5 }
  }

  offsetGlow(): { ox: number; oy: number } {
    return { ox: this.glowSmoothX - 0.5, oy: this.glowSmoothY - 0.5 }
  }

  attachWindowListeners(): () => void {
    const onMove = (e: MouseEvent) => {
      this.setTargetFromMouse(e.clientX, e.clientY, window.innerWidth, window.innerHeight)
    }
    const onOrient = (e: DeviceOrientationEvent) => {
      this.setTargetFromOrientation(e.beta ?? null, e.gamma ?? null)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('deviceorientation', onOrient, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('deviceorientation', onOrient)
    }
  }
}
