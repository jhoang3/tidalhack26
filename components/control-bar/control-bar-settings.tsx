import { Type, Settings } from "lucide-react"

interface ControlBarSettingsProps {
  textSize: "sm" | "md" | "lg"
  onTextSizeChange: () => void
}

export function ControlBarSettings({
  textSize,
  onTextSizeChange,
}: ControlBarSettingsProps) {
  return (
    <div className="flex flex-1 items-center justify-end gap-2">
      <button
        type="button"
        onClick={onTextSizeChange}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        aria-label={`Change text size, currently ${textSize}`}
      >
        <Type className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        aria-label="Open settings"
      >
        <Settings className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  )
}
