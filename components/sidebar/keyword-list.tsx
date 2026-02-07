import { useStore } from "@/hooks/useStore"
import { MOCK_KEYWORDS } from "@/lib/transcript"

export function KeywordList() {
  const keywords = useStore((s) => s.keywords)
  const displayKeywords = keywords.length > 0 ? keywords : MOCK_KEYWORDS
  const isEmpty = displayKeywords.length === 0

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
        Detected Keywords
      </p>
      {isEmpty ? (
        <p className="text-xs text-slate-500 italic">
          Upload a PDF to extract keywords
        </p>
      ) : (
        <div className="flex flex-wrap gap-2" role="list" aria-label="Detected technical keywords">
          {displayKeywords.map((kw) => (
            <span
              key={kw}
              role="listitem"
              className="inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 ring-1 ring-amber-500/20"
            >
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
