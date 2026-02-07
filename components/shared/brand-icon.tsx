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
      className={`flex ${containerClass} items-center justify-center rounded-lg bg-yellow-500/10 ${className ?? ""}`}
    >
      <Sparkles className={`${iconSize} text-yellow-500`} aria-hidden="true" />
    </div>
  )
}
