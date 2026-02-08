import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic } from "lucide-react"
import { useStore } from "@/hooks/useStore"
import { TranscriptSessionHeader } from "./transcript-session-header"
import { LiveTranscriptSegment } from "./live-transcript-segment"
import { InterimTranscript } from "./interim-transcript"
import { TimedTranscriptView } from "./timed-transcript-view"

export function TranscriptView() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const transcript = useStore((s) => s.transcript)
  const interimText = useStore((s) => s.interimText)
  const timedWords = useStore((s) => s.timedWords)
  const timedSegments = useStore((s) => s.timedSegments)
  const audioUrl = useStore((s) => s.audioUrl)
  const keywords = useStore((s) => s.keywords)
  const sessionId = useStore((s) => s.sessionId)
  const useFakeMode = useStore((s) => s.useFakeMode)
  const textSize = useStore((s) => s.textSize)
  const resetTranscript = useStore((s) => s.resetTranscript)
  const hasContext = !!sessionId || useFakeMode

  const hasTimedPlayback = timedWords.length > 0 && !!audioUrl

  const textSizeClass =
    textSize === "sm" ? "text-base" : textSize === "md" ? "text-lg" : "text-xl"

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }, [transcript, interimText, hasTimedPlayback])

  const isEmpty = transcript.length === 0 && !interimText

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-6 py-8 md:px-12 lg:px-20 scroll-smooth"
      role="log"
      aria-label="Live transcript"
      aria-live="polite"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <TranscriptSessionHeader />
          {(transcript.length > 0 || interimText || hasTimedPlayback) && (
            <button
              type="button"
              onClick={resetTranscript}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Clear transcript"
            >
              Clear
            </button>
          )}
        </div>
        <div className={`space-y-6 leading-relaxed ${textSizeClass}`}>
          <AnimatePresence mode="popLayout">
            {isEmpty && (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/80 ring-1 ring-slate-700/50">
                  <Mic className="h-8 w-8 text-slate-500" aria-hidden="true" />
                </div>
                <p className="text-lg font-medium text-slate-300">
                  Ready to listen
                </p>
                <p className="mt-2 max-w-sm text-sm text-slate-500 leading-relaxed">
                  {hasContext
                    ? "Click the red microphone to start captioning."
                    : "Upload a syllabus PDF for context-aware captions, or enable Fake Mode to test. Then click Start."}
                </p>
              </motion.div>
            )}

            {!hasTimedPlayback &&
              transcript.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: index * 0.02 }}
                >
                  <LiveTranscriptSegment item={item} />
                </motion.div>
              ))}

            {interimText && !hasTimedPlayback && (
              <motion.div
                key="interim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
              >
                <InterimTranscript
                  finalText=""
                  interimText={interimText}
                  keywords={keywords}
                />
              </motion.div>
            )}

            {hasTimedPlayback && audioUrl && (
              <motion.div
                key="timed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <TimedTranscriptView
                  timedWords={timedWords}
                  timedSegments={timedSegments}
                  audioUrl={audioUrl}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
