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
    const regex = new RegExp(`(${keyword})`, "gi")
    const match = remaining.match(regex)
    if (match) {
      const idx = remaining.toLowerCase().indexOf(keyword.toLowerCase())
      if (idx > 0) {
        parts.push(remaining.slice(0, idx))
      }
      parts.push(
        <mark
          key={`${keyword}-${idx}`}
          className="rounded bg-amber-500/10 font-semibold text-amber-400 px-0.5"
        >
          {remaining.slice(idx, idx + keyword.length)}
        </mark>
      )
      remaining = remaining.slice(idx + keyword.length)
    }
  }

  if (remaining) {
    parts.push(remaining)
  }

  return <>{parts}</>
}
