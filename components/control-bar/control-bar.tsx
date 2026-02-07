import { useState } from "react"
import { AudioWaveform } from "@/components/audio-waveform"
import { MicButton } from "./mic-button"
import { ControlBarSettings } from "./control-bar-settings"
import { useRecordingSession } from "@/hooks/useRecordingSession"

export function ControlBar() {
  const [textSize, setTextSize] = useState<"sm" | "md" | "lg">("md")
  const {
    isRecording,
    startRecording,
    stopRecording,
    recorderError,
  } = useRecordingSession()

  const cycleTextSize = () => {
    setTextSize((prev) => {
      if (prev === "sm") return "md"
      if (prev === "md") return "lg"
      return "sm"
    })
  }

  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <div className="border-t border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto flex h-24 max-w-5xl items-center justify-between px-6">
        <div className="hidden flex-1 items-center sm:flex">
          <AudioWaveform active={isRecording} />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-1">
          <MicButton isRecording={isRecording} onToggle={handleMicToggle} />
          {recorderError === "permission_denied" && (
            <span className="text-xs text-red-400">Microphone access denied</span>
          )}
        </div>
        <ControlBarSettings textSize={textSize} onTextSizeChange={cycleTextSize} />
      </div>
    </div>
  )
}
