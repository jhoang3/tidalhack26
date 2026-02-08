import { useCallback, useEffect, useRef, useState } from "react"

const BAR_COUNT = 32

/**
 * Returns real-time audio levels (0-1) from a MediaStream or HTMLAudioElement
 * using the Web Audio API AnalyserNode.
 */
export function useAudioLevels(
  source: MediaStream | HTMLAudioElement | null,
  enabled: boolean
): number[] {
  const [levels, setLevels] = useState<number[]>(() =>
    Array(BAR_COUNT).fill(0.15)
  )
  const rafRef = useRef<number>()
  const ctxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null>(null)

  const updateLevels = useCallback(() => {
    const analyser = analyserRef.current
    if (!analyser) return

    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(data)

    const step = Math.floor(data.length / BAR_COUNT)
    const newLevels = Array.from({ length: BAR_COUNT }, (_, i) => {
      const idx = Math.min(i * step, data.length - 1)
      return 0.15 + (data[idx] / 255) * 0.85
    })
    setLevels(newLevels)
  }, [])

  useEffect(() => {
    if (!source || !enabled) {
      setLevels(Array(BAR_COUNT).fill(0.15))
      return
    }

    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    ctxRef.current = ctx

    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.8
    analyserRef.current = analyser

    let sourceNode: MediaStreamAudioSourceNode | MediaElementAudioSourceNode
    if (source instanceof MediaStream) {
      sourceNode = ctx.createMediaStreamSource(source)
    } else {
      sourceNode = ctx.createMediaElementSource(source)
      sourceNode.connect(ctx.destination)
    }
    sourceRef.current = sourceNode
    sourceNode.connect(analyser)

    const loop = () => {
      updateLevels()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      sourceNode.disconnect()
      analyser.disconnect()
      ctx.close()
      ctxRef.current = null
      analyserRef.current = null
      sourceRef.current = null
    }
  }, [source, enabled, updateLevels])

  return levels
}
