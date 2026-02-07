import { Sparkles } from "lucide-react"

interface BrandIconProps {
  size?: "sm" | "md"
  className?: string
}

export function BrandIcon({ size = "md", className }: BrandIconProps) {
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5"
  const containerClass = size === "sm" ? "h-8 w-8" : "h-9 w-9"

  return (
    <div
      className={`flex ${containerClass} items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-amber-500/20 ${className ?? ""}`}
    >
      <Sparkles className={`${iconSize} text-amber-400`} aria-hidden="true" />
    </div>
  )
}
