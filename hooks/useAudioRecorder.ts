import { useCallback, useRef, useState } from "react"

export type RecorderError = "permission_denied" | "not_supported" | "unknown"

export function useAudioRecorder(
  sendAudio: (blob: Blob) => void,
  isActive: boolean
) {
  const [error, setError] = useState<RecorderError | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stop = useCallback(() => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop()
    }
    mediaRecorderRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setError(null)
  }, [])

  const start = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4"

      const mediaRecorder = new MediaRecorder(stream, { mimeType })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          sendAudio(event.data)
        }
      }

      mediaRecorder.start(250) // 250ms chunks = low latency
      mediaRecorderRef.current = mediaRecorder
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

  return { start, stop, error }
}
