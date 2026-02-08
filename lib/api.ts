/**
 * API configuration for LectureBridge.
 * Set VITE_API_URL in .env (e.g. http://localhost:8000)
 */
const getApiBase = () => {
  return import.meta.env.VITE_API_URL ?? "http://localhost:8000"
}

export const getUploadUrl = () => `${getApiBase()}/upload`
export const getUploadAudioUrl = () => `${getApiBase()}/upload-audio`

/** Base WebSocket URL for live transcription. sessionId is optional (for keyword biasing). */
export const getWebSocketUrl = (sessionId: string | null) => {
  const base = getApiBase().replace(/^http/, "ws")
  return sessionId ? `${base}/listen?session_id=${sessionId}` : `${base}/listen`
}

export interface TimedWord {
  word: string
  start: number
  end: number
}

export interface TimedSegment {
  transcript: string
  words: TimedWord[]
}

export interface UploadAudioResponse {
  transcript: string
  session_id: string
  words?: TimedWord[]
  segments?: TimedSegment[]
}

export async function uploadAudio(
  file: File,
  sessionId?: string | null,
  biasKeywords?: string[]
): Promise<UploadAudioResponse> {
  const formData = new FormData()
  formData.append("file", file)
  if (sessionId) formData.append("session_id", sessionId)
  if (biasKeywords?.length) {
    formData.append("bias_keywords", biasKeywords.join(","))
  }

  const res = await fetch(getUploadAudioUrl(), {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string }
    throw new Error(err.detail ?? `Upload failed (${res.status})`)
  }

  return res.json() as Promise<UploadAudioResponse>
}
