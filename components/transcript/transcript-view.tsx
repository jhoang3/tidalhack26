import { useRef, useEffect } from "react"
import { useStore } from "@/hooks/useStore"
import { TranscriptSessionHeader } from "./transcript-session-header"
import { LiveTranscriptSegment } from "./live-transcript-segment"
import { InterimTranscript } from "./interim-transcript"

export function TranscriptView() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const transcript = useStore((s) => s.transcript)
  const interimText = useStore((s) => s.interimText)
  const keywords = useStore((s) => s.keywords)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [transcript, interimText])

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-6 py-8 md:px-12 lg:px-20"
      role="log"
      aria-label="Live transcript"
      aria-live="polite"
    >
      <div className="mx-auto max-w-3xl">
        <TranscriptSessionHeader />
        <div className="space-y-6">
          {transcript.length === 0 && !interimText && (
            <p className="text-slate-500 text-center py-12">
              Ready to listen. Upload a syllabus PDF, then click Start to begin.
            </p>
          )}
          {transcript.map((item) => (
            <LiveTranscriptSegment key={item.id} item={item} />
          ))}
          {interimText && (
            <InterimTranscript
              finalText=""
              interimText={interimText}
              keywords={keywords}
            />
          )}
        </div>
      </div>
    </div>
  )
}
