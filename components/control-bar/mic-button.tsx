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
      className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-95 ${
        isRecording
          ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-mic-pulse hover:bg-red-600"
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
