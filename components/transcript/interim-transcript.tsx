import { HighlightedText } from "./highlighted-text"

interface InterimTranscriptProps {
  finalText: string
  interimText: string
  keywords: string[]
  timestamp?: string
}

export function InterimTranscript({
  finalText,
  interimText,
  keywords,
  timestamp = "00:04:58",
}: InterimTranscriptProps) {
  return (
    <div className="group">
      <span className="mb-1 block text-xs tabular-nums text-slate-600">
        {timestamp}
      </span>
      <p className="text-lg leading-relaxed">
        <span className="text-slate-50">
          <HighlightedText text={finalText} keywords={keywords} />
        </span>
        <span className="text-slate-500">
          {" "}
          {interimText}
        </span>
        <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-yellow-500" aria-hidden="true" />
      </p>
    </div>
  )
}
