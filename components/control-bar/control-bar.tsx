import { AudioWaveform } from "@/components/audio-waveform"
import { MicButton } from "./mic-button"
import { ControlBarSettings } from "./control-bar-settings"
import { useRecordingSession } from "@/hooks/useRecordingSession"
import { useStore } from "@/hooks/useStore"

export function ControlBar() {
  const textSize = useStore((s) => s.textSize)
  const setTextSize = useStore((s) => s.setTextSize)
  const audioLevelSource = useStore((s) => s.audioLevelSource)
  const {
    isRecording,
    startRecording,
    stopRecording,
    recorderError,
  } = useRecordingSession()

  const waveformActive = isRecording || !!audioLevelSource

  const cycleTextSize = () => {
    setTextSize(
      textSize === "sm" ? "md" : textSize === "md" ? "lg" : "sm"
    )
  }

  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <div className="border-t border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.3)]">
      <div className="mx-auto flex h-24 max-w-5xl items-center justify-between px-6">
        <div className="hidden flex-1 items-center sm:flex">
          <AudioWaveform active={waveformActive} source={audioLevelSource} />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-1">
          <MicButton isRecording={isRecording} onToggle={handleMicToggle} />
          {recorderError === "permission_denied" && (
            <span className="text-xs text-red-400 animate-pulse">
              Microphone access denied — check browser settings
            </span>
          )}
        </div>
        <ControlBarSettings textSize={textSize} onTextSizeChange={cycleTextSize} />
      </div>
    </div>
  )
}
