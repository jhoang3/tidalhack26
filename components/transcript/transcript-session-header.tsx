interface TranscriptSessionHeaderProps {
  title?: string
  subtitle?: string
  date?: string
}

export function TranscriptSessionHeader({
  title = "Advanced Fluid Dynamics — Lecture 14",
  subtitle = "Live Session",
  date = "Prof. A. Reynolds · Feb 7, 2026 · 10:00 AM",
}: TranscriptSessionHeaderProps) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
        {subtitle}
      </h2>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
        {title}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {date}
      </p>
    </div>
  )
}
