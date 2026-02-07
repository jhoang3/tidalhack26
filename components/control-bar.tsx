"use client"

import { useState } from "react"
import { Mic, MicOff, Type, Settings } from "lucide-react"
import { AudioWaveform } from "./audio-waveform"

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
        {/* Left: Waveform */}
        <div className="hidden flex-1 items-center sm:flex">
          <AudioWaveform active={isRecording} />
        </div>

        {/* Center: Mic Toggle */}
        <div className="flex flex-1 items-center justify-center">
          <button
            type="button"
            onClick={() => setIsRecording(!isRecording)}
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
        </div>

        {/* Right: Settings */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <button
            type="button"
            onClick={cycleTextSize}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
            aria-label={`Change text size, currently ${textSize}`}
          >
            <Type className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
            aria-label="Open settings"
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
