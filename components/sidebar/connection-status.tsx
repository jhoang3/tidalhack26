import { useStore } from "@/hooks/useStore"
import type { ConnectionStatusType } from "@/hooks/useStore"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

function StatusDot({ status }: { status: ConnectionStatusType }) {
  const config = {
    idle: { dot: "bg-slate-500", label: "Idle", ping: false },
    connecting: { dot: "bg-yellow-500", label: "Connecting...", ping: true },
    connected: { dot: "bg-emerald-500", label: "Deepgram Connected", ping: true },
    disconnected: { dot: "bg-slate-500", label: "Disconnected", ping: false },
    error: { dot: "bg-red-500", label: "Connection Error", ping: false },
  } as const

  const { dot, label, ping } = config[status]

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        {ping && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dot}`} />
        )}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dot}`} />
      </span>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  )
}

export function ConnectionStatus() {
  const connectionStatus = useStore((s) => s.connectionStatus)
  const useFakeMode = useStore((s) => s.useFakeMode)
  const setUseFakeMode = useStore((s) => s.setUseFakeMode)

  return (
    <div className="border-t border-slate-800 px-6 py-4 space-y-3">
      {useFakeMode ? (
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-yellow-500" />
          </span>
          <span className="text-xs text-slate-400">Fake Mode (Simulating)</span>
        </div>
      ) : (
        <StatusDot status={connectionStatus} />
      )}

      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="fake-mode" className="text-xs text-slate-500 cursor-pointer">
          Fake Mode
        </Label>
        <Switch
          id="fake-mode"
          checked={useFakeMode}
          onCheckedChange={setUseFakeMode}
        />
      </div>
    </div>
  )
}
