interface SidebarOverlayProps {
  onClose: () => void
}

export function SidebarOverlay({ onClose }: SidebarOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose()
      }}
      role="button"
      tabIndex={0}
      aria-label="Close sidebar"
    />
  )
}
