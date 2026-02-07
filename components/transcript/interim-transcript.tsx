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
  timestamp,
}: InterimTranscriptProps) {
  return (
    <div className="group rounded-lg bg-slate-800/30 px-4 py-3 ring-1 ring-slate-700/50">
      {timestamp && (
        <span className="mb-1 block text-xs tabular-nums text-slate-500">
          {timestamp}
        </span>
      )}
      <p className="text-lg leading-relaxed text-slate-50">
        {finalText && (
          <span>
            <HighlightedText text={finalText} keywords={keywords} />
          </span>
        )}
        <span className={finalText ? "text-slate-400" : "text-slate-400"}>
          {interimText}
        </span>
        <span
          className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-amber-400 align-middle"
          aria-hidden="true"
        />
      </p>
    </div>
  )
}
