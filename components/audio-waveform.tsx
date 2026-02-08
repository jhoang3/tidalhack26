import { useAudioLevels } from "@/hooks/useAudioLevels"

interface AudioWaveformProps {
  /** Whether the waveform is active (recording or playback) */
  active: boolean
  /** Source for real levels: MediaStream (live mic) or HTMLAudioElement (playback). When null, shows idle bars. */
  source?: MediaStream | HTMLAudioElement | null
}

export function AudioWaveform({ active, source = null }: AudioWaveformProps) {
  const levels = useAudioLevels(source, active)

  return (
    <div
      className="flex h-10 items-end gap-[2px]"
      role="img"
      aria-label={active ? "Audio waveform active — recording or playback" : "Audio waveform inactive"}
    >
      {levels.map((height, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full transition-all duration-150 ${
            active ? "bg-red-500/80" : "bg-slate-700"
          }`}
          style={{
            height: `${height * 100}%`,
            transformOrigin: "bottom",
          }}
        />
      ))}
    </div>
  )
}
