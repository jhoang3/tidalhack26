"use client"

import { Menu, X, Sparkles } from "lucide-react"

interface MobileHeaderProps {
  isOpen: boolean
  onToggle: () => void
}

export function MobileHeader({ isOpen, onToggle }: MobileHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10">
          <Sparkles className="h-4 w-4 text-yellow-500" aria-hidden="true" />
        </div>
        <span className="text-sm font-semibold text-slate-50">
          LectureBridge
        </span>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
        aria-label={isOpen ? "Close sidebar menu" : "Open sidebar menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    </header>
  )
}
