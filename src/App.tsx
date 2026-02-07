import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TranscriptView } from "@/components/transcript"
import { ControlBar } from "@/components/control-bar"
import { MobileHeader } from "@/components/mobile-header"
import { SidebarOverlay } from "@/components/shared/sidebar-overlay"

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-dvh flex-col bg-[#0f172a]">
      <MobileHeader
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="relative flex flex-1 overflow-hidden">
        {sidebarOpen && <SidebarOverlay onClose={() => setSidebarOpen(false)} />}

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
