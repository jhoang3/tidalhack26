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

  const send = useCallback((data: Blob) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(data)
    }
  }, [])

  useEffect(() => {
    if (!enabled || !url) {
      setStatus("idle")
      return
    }

    userDisconnectRef.current = false
    syncStatusToStore("connecting")
    const ws = new WebSocket(url)

    ws.onopen = () => {
      reconnectAttemptRef.current = 0
      syncStatusToStore("connected")
      socketRef.current = ws
    }

    ws.onmessage = handleMessage

    const tryReconnect = () => {
      if (
        userDisconnectRef.current ||
        !enabled ||
        reconnectAttemptRef.current >= MAX_RECONNECT_ATTEMPTS
      ) {
        syncStatusToStore("error")
        return
      }
      const delay = BASE_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttemptRef.current)
      reconnectAttemptRef.current++
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttemptRef.current = 0
        userDisconnectRef.current = false
        syncStatusToStore("connecting")
        const ws2 = new WebSocket(url)
        ws2.onopen = () => {
          syncStatusToStore("connected")
          socketRef.current = ws2
        }
        ws2.onmessage = handleMessage
        ws2.onclose = () => {
          socketRef.current = null
          flushPendingInterim()
          if (!userDisconnectRef.current) {
            syncStatusToStore("disconnected")
            tryReconnect()
          }
        }
        ws2.onerror = () => syncStatusToStore("error")
        socketRef.current = ws2
      }, delay)
    }

    ws.onclose = () => {
      socketRef.current = null
      flushPendingInterim()
      if (userDisconnectRef.current) {
        syncStatusToStore("idle")
        return
      }
      syncStatusToStore("disconnected")
      tryReconnect()
    }

    ws.onerror = () => syncStatusToStore("error")
    socketRef.current = ws

    return () => {
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
    }
  }, [enabled, url])

  return { status, send }
}
