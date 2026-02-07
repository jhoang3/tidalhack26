import { useMemo } from "react"

const BAR_COUNT = 32

export function AudioWaveform({ active }: { active: boolean }) {
  const bars = useMemo(() => {
    return Array.from({ length: BAR_COUNT }, (_, i) => ({
      id: i,
      height: Math.random() * 60 + 20,
      delay: Math.random() * 1.2,
      duration: 0.4 + Math.random() * 0.6,
    }))
  }, [])

  return (
    <div
      className="flex h-10 items-end gap-[2px]"
      role="img"
      aria-label={active ? "Audio waveform active — recording in progress" : "Audio waveform inactive"}
    >
      {bars.map((bar) => (
        <div
          key={bar.id}
          className={`w-[3px] rounded-full transition-all duration-300 ${
            active
              ? "bg-red-500/80"
              : "bg-slate-700"
          }`}
          style={
            active
              ? {
                  height: `${bar.height}%`,
                  animation: `waveform-bar ${bar.duration}s ease-in-out ${bar.delay}s infinite`,
                  transformOrigin: "bottom",
                }
              : {
                  height: "15%",
                }
          }
        />
      ))}
    </div>
  )
}
