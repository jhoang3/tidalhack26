import { useRef, useEffect } from "react"
import { MOCK_TRANSCRIPT } from "@/lib/transcript"
import { TranscriptSessionHeader } from "./transcript-session-header"
import { TranscriptSegmentItem } from "./transcript-segment"
import { InterimTranscript } from "./interim-transcript"

export function TranscriptView() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

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
          {MOCK_TRANSCRIPT.map((segment) => (
            <TranscriptSegmentItem key={segment.id} segment={segment} />
          ))}
          <InterimTranscript
            finalText="The Hessian matrix"
            interimText="of the cost function gives us second-order information about the curvature of the optimization landscape, which helps us..."
            keywords={["Hessian matrix"]}
          />
        </div>
      </div>
    </div>
  )
}
