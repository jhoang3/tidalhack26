export function ConnectionStatus() {
  return (
    <div className="border-t border-slate-800 px-6 py-4">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <span className="text-xs text-slate-400">Deepgram Connected</span>
      </div>
    </div>
  )
}
