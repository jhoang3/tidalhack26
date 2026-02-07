import { BrandIcon } from "@/components/shared/brand-icon"

export function SidebarHeader() {
  return (
    <div className="flex items-center gap-3 px-6 py-5">
      <BrandIcon size="md" />
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-slate-50">
          LectureBridge
        </h1>
        <p className="text-xs text-slate-500">Context-aware live captioning</p>
      </div>
    </div>
  )
}
