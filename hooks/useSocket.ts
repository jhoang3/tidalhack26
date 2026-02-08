import { useCallback, useEffect, useRef, useState } from "react"
import { useStore } from "./useStore"

export type SocketStatus = "idle" | "connecting" | "connected" | "disconnected" | "error"

interface TranscriptMessage {
  is_final?: boolean
  text?: string
  confidence?: number
}

const THROTTLE_MS = 100
const MAX_RECONNECT_ATTEMPTS = 3
const BASE_RECONNECT_DELAY_MS = 1000

export function useSocket(url: string | null, enabled: boolean) {
  const [status, setStatus] = useState<SocketStatus>("idle")
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectAttemptRef = useRef(0)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const userDisconnectRef = useRef(false)

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

    userDisconnectRef.current = false
    syncStatusToStore("connecting")
    const ws = new WebSocket(url)

    ws.onopen = () => {
      reconnectAttemptRef.current = 0
      syncStatusToStore("connected")
      socketRef.current = ws
    }

    ws.onmessage = handleMessage

    ws.onclose = () => {
      socketRef.current = null
      flushPendingInterim()

      if (userDisconnectRef.current) {
        syncStatusToStore("idle")
        return
      }

      syncStatusToStore("disconnected")

      if (enabled && reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = BASE_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttemptRef.current)
        reconnectAttemptRef.current++
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, delay)
      } else {
        syncStatusToStore("error")
      }
    }

    ws.onerror = () => {
      syncStatusToStore("error")
    }

    socketRef.current = ws
  }, [url, enabled, handleMessage, flushPendingInterim])

  const disconnect = useCallback(() => {
    userDisconnectRef.current = true
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    reconnectAttemptRef.current = MAX_RECONNECT_ATTEMPTS
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
