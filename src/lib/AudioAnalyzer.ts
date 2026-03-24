import { rmsFromByteTimeDomain } from './audioUtils'

const SMOOTH = 0.15

export class AudioAnalyzer {
  private ctx: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private stream: MediaStream | null = null
  private data: Uint8Array | null = null
  private smoothed = 0
  private raf = 0
  private running = false

  async start(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: false,
      })
      this.stream = stream
      this.ctx = new AudioContext()
      await this.ctx.resume()
      const source = this.ctx.createMediaStreamSource(stream)
      this.analyser = this.ctx.createAnalyser()
      this.analyser.fftSize = 2048
      this.data = new Uint8Array(this.analyser.fftSize)
      source.connect(this.analyser)
      this.running = true
      this.smoothed = 0
      const tick = () => {
        if (!this.running || !this.analyser || !this.data) return
        this.analyser.getByteTimeDomainData(this.data as Uint8Array<ArrayBuffer>)
        const raw = rmsFromByteTimeDomain(this.data)
        this.smoothed += (raw - this.smoothed) * SMOOTH
        this.raf = requestAnimationFrame(tick)
      }
      this.raf = requestAnimationFrame(tick)
      return true
    } catch {
      return false
    }
  }

  /** Valore lisciato (lerp 0.15), aggiornato ogni frame nel loop interno */
  getSmoothedRMS(): number {
    return this.smoothed
  }

  /** Un campione RMS non lisciato (richiede analyser attivo) */
  sampleRawRMS(): number {
    if (!this.analyser || !this.data) return 0
    this.analyser.getByteTimeDomainData(this.data as Uint8Array<ArrayBuffer>)
    return rmsFromByteTimeDomain(this.data)
  }

  stop(): void {
    this.running = false
    cancelAnimationFrame(this.raf)
    this.raf = 0
    this.stream?.getTracks().forEach((t) => t.stop())
    this.stream = null
    void this.ctx?.close()
    this.ctx = null
    this.analyser = null
    this.data = null
    this.smoothed = 0
  }
}
