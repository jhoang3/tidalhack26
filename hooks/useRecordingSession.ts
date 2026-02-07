import { useEffect } from "react"
import { useStore } from "./useStore"
import { useSocket } from "./useSocket"
import { useAudioRecorder } from "./useAudioRecorder"
import { useFakeSimulator } from "./useFakeSimulator"
import { getWebSocketUrl } from "@/lib/api"

export function useRecordingSession() {
  const isRecording = useStore((s) => s.isRecording)
  const sessionId = useStore((s) => s.sessionId)
  const useFakeMode = useStore((s) => s.useFakeMode)
  const setIsRecording = useStore((s) => s.setIsRecording)

  const shouldConnectSocket =
    isRecording && !useFakeMode && !!sessionId
  const wsUrl = sessionId ? getWebSocketUrl(sessionId) : null

  const { status, send } = useSocket(wsUrl, shouldConnectSocket)
  const { start: startRecorder, stop: stopRecorder, error: recorderError } =
    useAudioRecorder(send, isRecording && status === "connected")

  useFakeSimulator(isRecording && useFakeMode)

  useEffect(() => {
    if (isRecording && status === "connected" && !useFakeMode) {
      startRecorder()
    }
    return () => {
      stopRecorder()
    }
  }, [isRecording, status, useFakeMode, startRecorder, stopRecorder])

  const startRecording = () => {
    setIsRecording(true)
  }

  const stopRecording = () => {
    setIsRecording(false)
  }

  return {
    isRecording,
    status,
    recorderError,
    startRecording,
    stopRecording,
    useFakeMode,
    canStartReal: !!sessionId,
  }
}
