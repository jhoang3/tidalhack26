import type { TranscriptItem } from "@/hooks/useStore"
import { HighlightedText } from "./highlighted-text"
import { useStore } from "@/hooks/useStore"

interface LiveTranscriptSegmentProps {
  item: TranscriptItem
}

export function LiveTranscriptSegment({ item }: LiveTranscriptSegmentProps) {
  const keywords = useStore((s) => s.keywords)

  return (
    <div className="group rounded-lg px-1 py-2 transition-colors hover:bg-slate-800/20">
      {item.timestamp && (
        <span className="mb-1 block text-xs tabular-nums text-slate-500">
          {item.timestamp}
        </span>
      )}
      <p className="text-lg leading-relaxed text-slate-50">
        <HighlightedText text={item.text} keywords={keywords} />
      </p>
    </div>
  )
}
