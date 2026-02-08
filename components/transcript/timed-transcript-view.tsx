import { useRef, useState, useEffect, useCallback } from "react"
import { Play, Pause } from "lucide-react"
import type { TimedSegment, TimedWord } from "@/hooks/useStore"
import { HighlightedText } from "./highlighted-text"
import { useStore } from "@/hooks/useStore"

interface TimedTranscriptViewProps {
  timedWords: TimedWord[]
  timedSegments: TimedSegment[]
  audioUrl: string
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function TimedTranscriptView({ timedWords, timedSegments, audioUrl }: TimedTranscriptViewProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const keywords = useStore((s) => s.keywords)
  const textSize = useStore((s) => s.textSize)

  const textSizeClass =
    textSize === "sm" ? "text-base" : textSize === "md" ? "text-lg" : "text-xl"

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const syncTime = () => {
      const el = audioRef.current
      if (el) setCurrentTime(el.currentTime)
    }

    let rafId: number | null = null
    const loop = () => {
      const el = audioRef.current
      if (el && !el.paused) {
        setCurrentTime(el.currentTime)
        rafId = requestAnimationFrame(loop)
      }
    }

    const handlePlay = () => {
      syncTime()
      rafId = requestAnimationFrame(loop)
    }

    const handlePause = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      syncTime()
    }

    const handleSeek = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      syncTime()
      if (!audio.paused) {
        rafId = requestAnimationFrame(loop)
      }
    }

    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("seeking", handleSeek)
    audio.addEventListener("seeked", handleSeek)
    syncTime()

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("seeking", handleSeek)
      audio.removeEventListener("seeked", handleSeek)
    }
  }, [audioUrl])

  const handlePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play()
    } else {
      audio.pause()
    }
  }

  // Use live value from DOM when available to avoid React state delay
  const time = audioRef.current?.currentTime ?? currentTime
  const TOLERANCE = 0.02 // minimal, for floating point only

  const renderWords = (words: TimedWord[]) =>
    words.map((w, i) => {
      const isPast = w.end <= time + TOLERANCE
      const isCurrent = time >= w.start - TOLERANCE && time < w.end + TOLERANCE

      return (
        <span
          key={`${i}-${w.start}`}
          className={
            isCurrent
              ? "font-semibold text-amber-400"
              : isPast
                ? "text-slate-300"
                : "text-slate-600"
          }
        >
          <HighlightedText
            text={w.word}
            keywords={isPast || isCurrent ? keywords : []}
          />
          {i < words.length - 1 ? " " : ""}
        </span>
      )
    })

  return (
    <div className="space-y-4">
      {/* Audio player */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
        <button
          type="button"
          onClick={handlePlayPause}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 transition-colors hover:bg-amber-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          aria-label="Play / Pause"
        >
          <PlayPauseIcon audioRef={audioRef} />
        </button>
        <audio ref={audioCallbackRef} src={audioUrl} className="flex-1 min-w-0 h-8" controls />
      </div>

      {/* Transcript - segmented by utterances, words sync with playback */}
      <div className={`space-y-4 leading-relaxed [font-size:inherit] ${textSizeClass}`}>
        {timedSegments.length > 0 ? (
          timedSegments.map((seg, segIdx) => (
            <div key={segIdx} className="flex gap-3">
              <span className="mt-1 shrink-0 text-xs tabular-nums text-slate-500 min-w-[2.5rem]">
                {formatTimestamp(seg.words[0]?.start ?? 0)}
              </span>
              <p className="flex-1 text-slate-50">
                {seg.words.length > 0 ? (
                  renderWords(seg.words)
                ) : (
                  <HighlightedText text={seg.transcript} keywords={keywords} />
                )}
              </p>
            </div>
          ))
        ) : (
          <p>
            {timedWords.map((w, i) => {
              const isPast = w.end <= time + TOLERANCE
              const isCurrent =
                time >= w.start - TOLERANCE && time < w.end + TOLERANCE

              return (
                <span
                  key={`${i}-${w.start}`}
                  className={
                    isCurrent
                      ? "font-semibold text-amber-400"
                      : isPast
                        ? "text-slate-300"
                        : "text-slate-600"
                  }
                >
                  <HighlightedText
                    text={w.word}
                    keywords={isPast || isCurrent ? keywords : []}
                  />
                  {i < timedWords.length - 1 ? " " : ""}
                </span>
              )
            })}
          </p>
        )}
      </div>
    </div>
  )
}

function PlayPauseIcon({ audioRef }: { audioRef: React.RefObject<HTMLAudioElement | null> }) {
  const [paused, setPaused] = useState(true)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onPlay = () => setPaused(false)
    const onPause = () => setPaused(true)
    setPaused(audio.paused)

    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    return () => {
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
    }
  }, [audioRef])

  return paused ? (
    <Play className="h-5 w-5 ml-0.5" aria-hidden />
  ) : (
    <Pause className="h-5 w-5" aria-hidden />
  )
}
