import { useCallback, useEffect, useRef, useState } from 'react'

const SMOOTH = 0.14

export function useMicrophoneRMS(active: boolean) {
  const [rms, setRms] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const bufRef = useRef<Float32Array | null>(null)
  const smoothRef = useRef(0)
  const rafRef = useRef<number>(0)

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    void ctxRef.current?.close()
    ctxRef.current = null
    analyserRef.current = null
    bufRef.current = null
    smoothRef.current = 0
    setRms(0)
  }, [])

  useEffect(() => {
    if (!active) return

    let cancelled = false

    ;(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
          video: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        const ctx = new AudioContext()
        ctxRef.current = ctx
        await ctx.resume()
        const source = ctx.createMediaStreamSource(stream)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 2048
        analyser.smoothingTimeConstant = 0.65
        source.connect(analyser)
        analyserRef.current = analyser
        bufRef.current = new Float32Array(analyser.fftSize)

        const loop = () => {
          if (!analyserRef.current || !bufRef.current) return
          const copy = bufRef.current
          analyserRef.current.getFloatTimeDomainData(copy as Float32Array<ArrayBuffer>)
          let sum = 0
          for (let i = 0; i < bufRef.current.length; i++) {
            const x = bufRef.current[i]
            sum += x * x
          }
          const raw = Math.sqrt(sum / bufRef.current.length)
          smoothRef.current += (raw - smoothRef.current) * SMOOTH
          setRms(Math.min(1, smoothRef.current * 4.2))
          rafRef.current = requestAnimationFrame(loop)
        }
        rafRef.current = requestAnimationFrame(loop)
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Microfono non disponibile')
        setRms(0)
      }
    })()

    return () => {
      cancelled = true
      stop()
    }
  }, [active, stop])

  return { rms, error, stopMic: stop }
}
