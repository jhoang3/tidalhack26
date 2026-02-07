interface TranscriptSessionHeaderProps {
  title?: string
  subtitle?: string
  date?: string
}

export function TranscriptSessionHeader({
  title = "Live Session",
  subtitle = "LectureBridge",
  date = "Ready for captioning",
}: TranscriptSessionHeaderProps) {
  return (
    <div className="mb-8 pb-6 border-b border-slate-800/80">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {subtitle}
      </p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-50">
        {title}
      </h2>
      <p className="mt-0.5 text-sm text-slate-500">
        {date}
      </p>
    </div>
  )
}
