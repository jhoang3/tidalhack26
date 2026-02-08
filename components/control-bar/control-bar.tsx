import { useState, useEffect } from "react"
import { AudioWaveform } from "@/components/audio-waveform"
import { MicButton } from "./mic-button"
import { ControlBarSettings } from "./control-bar-settings"
import { useRecordingSession } from "@/hooks/useRecordingSession"
import { useStore } from "@/hooks/useStore"

export function ControlBar() {
  const textSize = useStore((s) => s.textSize)
  const setTextSize = useStore((s) => s.setTextSize)
  const sessionId = useStore((s) => s.sessionId)
  const useFakeMode = useStore((s) => s.useFakeMode)
  const {
    isRecording,
    startRecording,
    stopRecording,
    recorderError,
  } = useRecordingSession()

  const [startHint, setStartHint] = useState(false)
  const canStart = !!sessionId || useFakeMode

  useEffect(() => {
    if (startHint) {
      const t = setTimeout(() => setStartHint(false), 4000)
      return () => clearTimeout(t)
    }
  }, [startHint])

  const cycleTextSize = () => {
    setTextSize(
      textSize === "sm" ? "md" : textSize === "md" ? "lg" : "sm"
    )
  }

  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording()
    } else if (!canStart) {
      setStartHint(true)
    } else {
      startRecording()
    }
  }

  return (
    <div className="border-t border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.3)]">
      <div className="mx-auto flex h-24 max-w-5xl items-center justify-between px-6">
        <div className="hidden flex-1 items-center sm:flex">
          <AudioWaveform active={isRecording} />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-1">
          <MicButton isRecording={isRecording} onToggle={handleMicToggle} />
          {recorderError === "permission_denied" && (
            <span className="text-xs text-red-400 animate-pulse">
              Microphone access denied — check browser settings
            </span>
          )}
          {startHint && (
            <span className="text-xs text-amber-400">
              Upload a PDF or enable Fake Mode to start
            </span>
          )}
        </div>
        <ControlBarSettings textSize={textSize} onTextSizeChange={cycleTextSize} />
      </div>
    </div>
  )
}
