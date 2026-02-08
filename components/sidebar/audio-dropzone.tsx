import { useState, useCallback, useRef } from "react"
import { Upload, Music, X, Loader2, AlertCircle } from "lucide-react"
import { uploadAudio } from "@/lib/api"
import { useStore } from "@/hooks/useStore"

const ACCEPT = ".mp3,.wav,.m4a,.ogg,.webm"
const AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/m4a",
  "audio/ogg",
  "audio/webm",
]

function isAudioFile(file: File): boolean {
  const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase()
  if ([".mp3", ".wav", ".m4a", ".ogg", ".webm"].includes(ext)) return true
  return AUDIO_TYPES.includes(file.type)
}

export function AudioDropzone() {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const sessionId = useStore((s) => s.sessionId)
  const keywords = useStore((s) => s.keywords)
  const setSessionId = useStore((s) => s.setSessionId)
  const setTranscriptFull = useStore((s) => s.setTranscriptFull)
  const setTimedTranscript = useStore((s) => s.setTimedTranscript)

  const uploadFile = useCallback(
    async (file: File) => {
      if (!isAudioFile(file)) return

      setIsUploading(true)
      setError(null)

      try {
        const { transcript, session_id, words = [], segments = [] } = await uploadAudio(
          file,
          sessionId ?? undefined,
          keywords.length ? keywords : undefined
        )
        setSessionId(session_id)
        if (words.length || segments.length) {
          const audioUrl = URL.createObjectURL(file)
          setTimedTranscript(transcript, words, segments, audioUrl)
        } else {
          setTranscriptFull(transcript)
        }
        setUploadedFile(file.name)
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message === "Failed to fetch"
              ? "Cannot reach server. Is the backend running?"
              : err.message
            : "Upload failed"
        setError(message)
        setUploadedFile(null)
      } finally {
        setIsUploading(false)
      }
    },
    [sessionId, keywords, setSessionId, setTranscriptFull, setTimedTranscript]
  )

  const handleRemove = useCallback(() => {
    setUploadedFile(null)
    setError(null)
  }, [])

  const handleFile = useCallback(
    (file: File | null) => {
      if (file) {
        uploadFile(file)
      } else {
        handleRemove()
      }
    },
    [uploadFile, handleRemove]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (isUploading) return
      const file = e.dataTransfer.files[0]
      if (file && isAudioFile(file)) handleFile(file)
    },
    [handleFile, isUploading]
  )

  const handleClick = useCallback(() => {
    if (!isUploading) inputRef.current?.click()
  }, [isUploading])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
      e.target.value = ""
    },
    [handleFile]
  )

  return (
    <div className="px-6 py-5">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
        Transcribe Audio
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />
      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 ring-1 ring-red-500/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {uploadedFile ? (
        <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 transition-colors hover:border-slate-600">
          <Music
            className="h-5 w-5 shrink-0 text-amber-400"
            aria-hidden="true"
          />
          <span className="truncate text-sm text-slate-300">
            {uploadedFile}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isUploading}
            className="ml-auto shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50"
            aria-label="Remove uploaded file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              handleClick()
            }
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-all duration-200 ${
            isUploading
              ? "cursor-wait border-slate-600 bg-slate-800/50"
              : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/40"
          }`}
          aria-label="Drop audio file here or click to browse"
          aria-busy={isUploading}
        >
          {isUploading ? (
            <Loader2
              className="mb-2 h-6 w-6 animate-spin text-amber-400"
              aria-hidden="true"
            />
          ) : (
            <Upload
              className="mb-2 h-6 w-6 text-slate-600"
              aria-hidden="true"
            />
          )}
          <p className="text-sm font-medium text-slate-300">
            {isUploading ? "Transcribing..." : "Upload MP3 or WAV"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Upload a recording to transcribe
          </p>
        </div>
      )}
    </div>
  )
}
