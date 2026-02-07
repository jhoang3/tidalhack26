import { Mic, MicOff } from "lucide-react"

interface MicButtonProps {
  isRecording: boolean
  onToggle: () => void
}

export function MicButton({ isRecording, onToggle }: MicButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
        isRecording
          ? "bg-red-500 text-white shadow-lg shadow-red-500/25 animate-mic-pulse"
          : "bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200"
      }`}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
      aria-pressed={isRecording}
    >
      {isRecording ? (
        <Mic className="h-7 w-7" aria-hidden="true" />
      ) : (
        <MicOff className="h-7 w-7" aria-hidden="true" />
      )}
    </button>
  )
}
