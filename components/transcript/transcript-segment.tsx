import type { TranscriptSegment } from "@/lib/transcript"
import { HighlightedText } from "./highlighted-text"

interface TranscriptSegmentProps {
  segment: TranscriptSegment
}

export function TranscriptSegmentItem({ segment }: TranscriptSegmentProps) {
  return (
    <div className="group">
      <span className="mb-1 block text-xs tabular-nums text-slate-600">
        {segment.timestamp}
      </span>
      <p className="text-lg leading-relaxed text-slate-50">
        <HighlightedText text={segment.text} keywords={segment.keywords} />
      </p>
    </div>
  )
}
