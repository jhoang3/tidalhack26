import { useEffect, useMemo } from "react"
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
  const setAudioLevelSource = useStore((s) => s.setAudioLevelSource)

  const shouldConnectSocket = useMemo(
    () => isRecording && !useFakeMode,
    [isRecording, useFakeMode]
  )
  const wsUrl = useMemo(
    () => (shouldConnectSocket ? getWebSocketUrl(sessionId) : null),
    [shouldConnectSocket, sessionId]
  )

  const { status, send } = useSocket(wsUrl, shouldConnectSocket)
  const { start: startRecorder, stop: stopRecorder, error: recorderError, stream } =
    useAudioRecorder(send, isRecording && status === "connected")

  useEffect(() => {
    if (isRecording && stream) {
      setAudioLevelSource(stream)
    } else if (!isRecording) {
      setAudioLevelSource(null)
    }
  }, [isRecording, stream, setAudioLevelSource])

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
