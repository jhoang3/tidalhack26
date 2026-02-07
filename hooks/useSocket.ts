import { useCallback, useEffect, useRef, useState } from "react"
import { useStore } from "./useStore"

export type SocketStatus = "idle" | "connecting" | "connected" | "disconnected" | "error"

interface TranscriptMessage {
  is_final?: boolean
  text?: string
  confidence?: number
}

const THROTTLE_MS = 100

export function useSocket(url: string | null, enabled: boolean) {
  const [status, setStatus] = useState<SocketStatus>("idle")
  const socketRef = useRef<WebSocket | null>(null)

  const syncStatusToStore = (s: SocketStatus) => {
    setStatus(s)
    useStore.getState().setConnectionStatus(s)
  }
  const lastUpdateRef = useRef(0)
  const pendingInterimRef = useRef<string>("")

  const flushPendingInterim = useCallback(() => {
    if (pendingInterimRef.current) {
      useStore.getState().setInterimText(pendingInterimRef.current)
      pendingInterimRef.current = ""
    }
  }, [])

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data: TranscriptMessage = JSON.parse(event.data)
      const text = data.text?.trim()
      if (!text) return

      const now = Date.now()
      const isFinal = data.is_final === true
      const { addTranscriptItem, setInterimText } = useStore.getState()

      if (isFinal) {
        addTranscriptItem({
          id: crypto.randomUUID(),
          text,
          isFinal: true,
          confidence: data.confidence ?? 1,
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        })
        pendingInterimRef.current = ""
        setInterimText("")
      } else {
        if (now - lastUpdateRef.current >= THROTTLE_MS) {
          setInterimText(text)
          pendingInterimRef.current = ""
          lastUpdateRef.current = now
        } else {
          pendingInterimRef.current = text
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  const connect = useCallback(() => {
    if (!url || !enabled) return

    syncStatusToStore("connecting")
    const ws = new WebSocket(url)

    ws.onopen = () => {
      syncStatusToStore("connected")
      socketRef.current = ws
    }

    ws.onmessage = handleMessage

    ws.onclose = () => {
      socketRef.current = null
      syncStatusToStore("disconnected")
      flushPendingInterim()
    }

    ws.onerror = () => {
      syncStatusToStore("error")
    }

    socketRef.current = ws
  }, [url, enabled, handleMessage, flushPendingInterim])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }
    syncStatusToStore("idle")
  }, [])

  const send = useCallback((data: Blob) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(data)
    }
  }, [])

  useEffect(() => {
    if (enabled && url) {
      connect()
    }
    return () => disconnect()
  }, [enabled, url, connect, disconnect])

  return { status, send, connect, disconnect }
}
