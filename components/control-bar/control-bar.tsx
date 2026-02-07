import { useState } from "react"
import { AudioWaveform } from "@/components/audio-waveform"
import { MicButton } from "./mic-button"
import { ControlBarSettings } from "./control-bar-settings"

export function ControlBar() {
  const [isRecording, setIsRecording] = useState(true)
  const [textSize, setTextSize] = useState<"sm" | "md" | "lg">("md")

  const cycleTextSize = () => {
    setTextSize((prev) => {
      if (prev === "sm") return "md"
      if (prev === "md") return "lg"
      return "sm"
    })
  }

  return (
    <div className="border-t border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto flex h-24 max-w-5xl items-center justify-between px-6">
        <div className="hidden flex-1 items-center sm:flex">
          <AudioWaveform active={isRecording} />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <MicButton isRecording={isRecording} onToggle={() => setIsRecording(!isRecording)} />
        </div>
        <ControlBarSettings textSize={textSize} onTextSizeChange={cycleTextSize} />
      </div>
    </div>
  )
}
