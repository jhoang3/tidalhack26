import { MOCK_KEYWORDS } from "@/lib/transcript"

export function KeywordList() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
        Detected Keywords
      </p>
      <div className="flex flex-wrap gap-2" role="list" aria-label="Detected technical keywords">
        {MOCK_KEYWORDS.map((kw) => (
          <span
            key={kw}
            role="listitem"
            className="inline-flex rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-500"
          >
            {kw}
          </span>
        ))}
      </div>
    </div>
  )
}
