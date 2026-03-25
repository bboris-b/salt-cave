/**
 * RMS normalizzato (circa 0–1) da AnalyserNode.getByteTimeDomainData (centro 128).
 */
export function rmsFromByteTimeDomain(data: Uint8Array): number {
  let sum = 0
  const n = data.length
  for (let i = 0; i < n; i++) {
    const v = (data[i] - 128) / 128
    sum += v * v
  }
  return Math.sqrt(sum / n)
}

/**
 * Buffer “piatto” a 128: tipico quando l’Analyser non riceve segnale reale (graph non alimentato o stream vuoto).
 * Il silenzio reale dal microfono ha quasi sempre jitter > 0 su almeno qualche campione.
 */
export function isByteTimeDomainStuckAtSilence(data: Uint8Array): boolean {
  const n = data.length
  if (n === 0) return true
  for (let i = 0; i < n; i++) {
    if (data[i] !== 128) return false
  }
  return true
}

export function meanStd(values: number[]): { mean: number; std: number } {
  if (values.length === 0) return { mean: 0, std: 0 }
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const v = values.reduce((s, x) => s + (x - mean) ** 2, 0) / values.length
  return { mean, std: Math.sqrt(v) }
}
