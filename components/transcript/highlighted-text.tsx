import React from "react"

interface HighlightedTextProps {
  text: string
  keywords: string[]
}

export function HighlightedText({ text, keywords }: HighlightedTextProps) {
  if (keywords.length === 0) return <span>{text}</span>

  const parts: React.ReactNode[] = []
  let remaining = text

  for (const keyword of keywords) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const regex = new RegExp(`\\b${escaped}\\b`, "gi")
    const match = regex.exec(remaining)
    if (match) {
      const idx = match.index
      const matchedText = match[0]
      if (idx > 0) {
        parts.push(remaining.slice(0, idx))
      }
      parts.push(
        <mark
          key={`${keyword}-${idx}`}
          className="rounded bg-amber-500/10 font-semibold text-amber-400 px-0.5"
        >
          {matchedText}
        </mark>
      )
      remaining = remaining.slice(idx + matchedText.length)
    }
  }

  if (remaining) {
    parts.push(remaining)
  }

  return <>{parts}</>
}
