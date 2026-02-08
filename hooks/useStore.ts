import { create } from "zustand"

export interface TranscriptItem {
  id: string
  text: string
  isFinal: boolean
  confidence: number
  timestamp?: string
}

export interface TimedWord {
  word: string
  start: number
  end: number
}

export interface TimedSegment {
  transcript: string
  words: TimedWord[]
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
  /** Word-level timestamps for sync-with-playback (from audio upload) */
  timedWords: TimedWord[]
  /** Object URL for playing the uploaded audio in sync with transcript */
  audioUrl: string | null
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
  setTimedTranscript: (transcript: string, words: TimedWord[], segments: TimedSegment[], audioUrl: string | null) => void
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
  timedWords: [],
  timedSegments: [],
  audioUrl: null,
  audioLevelSource: null,

  setSessionId: (id) => set({ sessionId: id }),
  setAudioLevelSource: (source) => set({ audioLevelSource: source }),
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

  resetTranscript: () =>
    set((state) => {
      if (state.audioUrl) URL.revokeObjectURL(state.audioUrl)
      return {
        transcript: [],
        interimText: "",
        timedWords: [],
        timedSegments: [],
        audioUrl: null,
        audioLevelSource: null,
      }
    }),

  setTranscriptFull: (text) => {
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
    const items = sentences.length
      ? sentences.map((s) => ({
          id: crypto.randomUUID(),
          text: s,
          isFinal: true,
          confidence: 1,
        }))
      : [
          {
            id: crypto.randomUUID(),
            text,
            isFinal: true,
            confidence: 1,
          },
        ]
    set({
      transcript: items,
      interimText: "",
      timedWords: [],
      timedSegments: [],
      audioUrl: null,
    })
  },

  setTimedTranscript: (transcript, words, segments, audioUrl) =>
    set((state) => {
      if (state.audioUrl) URL.revokeObjectURL(state.audioUrl)
      return {
        transcript: [
          {
            id: crypto.randomUUID(),
            text: transcript,
            isFinal: true,
            confidence: 1,
          },
        ],
        interimText: "",
        timedWords: words,
        timedSegments: segments,
        audioUrl,
      }
    }),
}))
