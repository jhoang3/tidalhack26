import { create } from "zustand"

export interface TranscriptItem {
  id: string
  text: string
  isFinal: boolean
  confidence: number
  timestamp?: string
}

interface AppState {
  sessionId: string | null
  isRecording: boolean
  transcript: TranscriptItem[]
  interimText: string
  keywords: string[]
  useFakeMode: boolean
  setSessionId: (id: string | null) => void
  addTranscriptItem: (item: TranscriptItem) => void
  setInterimText: (text: string) => void
  setKeywords: (keywords: string[]) => void
  setIsRecording: (recording: boolean) => void
  setUseFakeMode: (use: boolean) => void
  resetTranscript: () => void
}

export const useStore = create<AppState>((set) => ({
  sessionId: null,
  isRecording: false,
  transcript: [],
  interimText: "",
  keywords: [],
  useFakeMode: false,
  connectionStatus: "idle" as ConnectionStatusType,

  setSessionId: (id) => set({ sessionId: id }),
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
}))
