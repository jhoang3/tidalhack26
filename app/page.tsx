"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TranscriptView } from "@/components/transcript-view"
import { ControlBar } from "@/components/control-bar"
import { MobileHeader } from "@/components/mobile-header"

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-dvh flex-col bg-[#0f172a]">
      {/* Mobile header with hamburger */}
      <MobileHeader
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="relative flex flex-1 overflow-hidden">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSidebarOpen(false)
            }}
            role="button"
            tabIndex={0}
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar */}
        <Sidebar
          className={`fixed inset-y-0 left-0 z-40 w-80 border-r border-slate-800 bg-[#0f172a] transition-transform duration-300 ease-in-out lg:relative lg:z-auto lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        />

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <TranscriptView />
          <ControlBar />
        </main>
      </div>
    </div>
  )
}
