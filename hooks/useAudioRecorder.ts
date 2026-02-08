import { useCallback, useRef, useState } from "react"

export type RecorderError = "permission_denied" | "not_supported" | "unknown"

/** Sample rate for linear16 PCM. Must match backend. */
export const LIVE_SAMPLE_RATE = 48000

/** Convert Float32 to Int16 (linear16 PCM). */
function float32ToInt16(float32: Float32Array): ArrayBuffer {
  const int16 = new Int16Array(float32.length)
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]))
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return int16.buffer
}

export function useAudioRecorder(
  sendAudio: (blob: Blob) => void,
  isActive: boolean
) {
  const [error, setError] = useState<RecorderError | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stop = useCallback(() => {
    processorRef.current?.disconnect()
    processorRef.current = null
    sourceRef.current?.disconnect()
    sourceRef.current = null
    audioContextRef.current?.close()
    audioContextRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setStream(null)
    setError(null)
  }, [])

  const start = useCallback(async () => {
    setError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = mediaStream
      setStream(mediaStream)

      const ctx = new (window.AudioContext || (window as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
        sampleRate: LIVE_SAMPLE_RATE,
      })
      audioContextRef.current = ctx

      const source = ctx.createMediaStreamSource(mediaStream)
      sourceRef.current = source

      const processor = ctx.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor

      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0)
        const pcm = float32ToInt16(input)
        if (pcm.byteLength > 0) {
          sendAudio(new Blob([pcm]))
        }
      }

      source.connect(processor)
      const gain = ctx.createGain()
      gain.gain.value = 0
      processor.connect(gain)
      gain.connect(ctx.destination)
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          setError("permission_denied")
        } else if (err.name === "NotFoundError") {
          setError("not_supported")
        } else {
          setError("unknown")
        }
      } else {
        setError("unknown")
      }
    }
  }, [sendAudio])

  return { start, stop, error, stream }
}
