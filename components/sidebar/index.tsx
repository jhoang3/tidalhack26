import { SidebarHeader } from "./sidebar-header"
import { PdfDropzone } from "./pdf-dropzone"
import { KeywordList } from "./keyword-list"
import { ConnectionStatus } from "./connection-status"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside className={className}>
      <div className="flex h-full flex-col">
        <SidebarHeader />
        <div className="mx-6 h-px bg-slate-800" />
        <PdfDropzone />
        <div className="mx-6 h-px bg-slate-800" />
        <KeywordList />
        <ConnectionStatus />
      </div>
    </aside>
  )
}
