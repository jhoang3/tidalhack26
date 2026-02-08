import { create } from "zustand"

export interface TranscriptItem {
  id: string
  text: string
  isFinal: boolean
  confidence: number
  timestamp?: string
}

export type TextSize = "sm" | "md" | "lg"

export type ConnectionStatusType = "idle" | "connecting" | "connected" | "disconnected" | "error"

interface AppState {
  connectionStatus: ConnectionStatusType
  sessionId: string | null
  isRecording: boolean
  transcript: TranscriptItem[]
  interimText: string
  keywords: string[]
  useFakeMode: boolean
  textSize: TextSize
  setSessionId: (id: string | null) => void
  addTranscriptItem: (item: TranscriptItem) => void
  setInterimText: (text: string) => void
  setKeywords: (keywords: string[]) => void
  setIsRecording: (recording: boolean) => void
  setUseFakeMode: (use: boolean) => void
  setTextSize: (size: TextSize) => void
  setConnectionStatus: (status: ConnectionStatusType) => void
  resetTranscript: () => void
  setTranscriptFull: (text: string) => void
}

export const useStore = create<AppState>((set) => ({
  sessionId: null,
  isRecording: false,
  transcript: [],
  interimText: "",
  keywords: [],
  useFakeMode: false,
  textSize: "md" as TextSize,
  connectionStatus: "idle" as ConnectionStatusType,

  setSessionId: (id) => set({ sessionId: id }),
  setTextSize: (size) => set({ textSize: size }),
  setUseFakeMode: (use) => set({ useFakeMode: use }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  addTranscriptItem: (item) =>
    set((state) => ({
      transcript: [...state.transcript, item],
      interimText: "", // Clear interim when final arrives
    })),

  setInterimText: (text) => set({ interimText: text }),

  setKeywords: (keywords) => set({ keywords }),

  setIsRecording: (recording) => set({ isRecording: recording }),

  resetTranscript: () => set({ transcript: [], interimText: "" }),

  setTranscriptFull: (text) =>
    set({
      transcript: [
        {
          id: crypto.randomUUID(),
          text,
          isFinal: true,
          confidence: 1,
        },
      ],
      interimText: "",
    }),
}))
