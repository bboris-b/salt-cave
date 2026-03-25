import { isByteTimeDomainStuckAtSilence, rmsFromByteTimeDomain } from './audioUtils'

/** Più alto = risposta più rapida al microfono (UI + detector leggono questo valore). */
const SMOOTH = 0.22

const PIPELINE_CHECK_FRAMES = 16
/** Soglia: solo se quasi tutti i frame sono “piatti” a 128 (pipeline non alimentata). */
const PIPELINE_FAIL_THRESHOLD = 13

export type AudioStartFailureReason =
  | 'permission_denied'
  | 'no_audio_track'
  | 'track_not_live'
  | 'audio_context_blocked'
  | 'pipeline_silent'

export type AudioStartResult = { ok: true } | { ok: false; reason: AudioStartFailureReason }

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

async function ensureAudioContextRunning(ctx: AudioContext): Promise<boolean> {
  for (let i = 0; i < 24; i++) {
    if (ctx.state === 'closed') return false
    if (ctx.state === 'running') return true
    try {
      await ctx.resume()
    } catch {
      return false
    }
    await nextFrame()
  }
  return ctx.state === 'running'
}

export class AudioAnalyzer {
  private ctx: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private stream: MediaStream | null = null
  private data: Uint8Array | null = null
  private smoothed = 0
  private raf = 0
  private running = false

  async start(): Promise<AudioStartResult> {
    const releaseStream = (s: MediaStream | null) => {
      s?.getTracks().forEach((t) => t.stop())
    }

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: false,
      })
    } catch {
      return { ok: false, reason: 'permission_denied' }
    }

    const audioTracks = stream.getAudioTracks()
    if (audioTracks.length === 0) {
      releaseStream(stream)
      return { ok: false, reason: 'no_audio_track' }
    }

    const primary = audioTracks[0]
    if (primary.readyState !== 'live') {
      releaseStream(stream)
      return { ok: false, reason: 'track_not_live' }
    }

    const ctx = new AudioContext()
    const runningOk = await ensureAudioContextRunning(ctx)
    if (!runningOk) {
      await ctx.close().catch(() => {})
      releaseStream(stream)
      return { ok: false, reason: 'audio_context_blocked' }
    }

    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 2048
    const data = new Uint8Array(analyser.fftSize)
    source.connect(analyser)

    let stuckFrames = 0
    for (let f = 0; f < PIPELINE_CHECK_FRAMES; f++) {
      await nextFrame()
      analyser.getByteTimeDomainData(data as Uint8Array<ArrayBuffer>)
      if (isByteTimeDomainStuckAtSilence(data)) stuckFrames++
    }

    if (stuckFrames >= PIPELINE_FAIL_THRESHOLD) {
      source.disconnect()
      analyser.disconnect()
      await ctx.close().catch(() => {})
      releaseStream(stream)
      return { ok: false, reason: 'pipeline_silent' }
    }

    this.stream = stream
    this.ctx = ctx
    this.analyser = analyser
    this.data = data
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
    return { ok: true }
  }

  /** Valore lisciato, aggiornato ogni frame nel loop interno */
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
