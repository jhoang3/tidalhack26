import { useEffect, useRef } from "react"
import { useStore } from "./useStore"

const FAKE_PHRASES = [
  "Good morning everyone and welcome to today's lecture.",
  "Today we'll be discussing the Navier-Stokes equations.",
  "The key challenge with turbulence is that it's inherently stochastic.",
  "Let's look at the eigenvalues of the Reynolds stress tensor.",
  "We apply a Fourier Transform to decompose the velocity field.",
  "The Lagrangian framework tracks individual fluid particles.",
  "Gradient descent optimization minimizes the error between simulated and experimental data.",
  "A Bayesian approach allows us to incorporate prior knowledge.",
]

export function useFakeSimulator(enabled: boolean) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phraseIndexRef = useRef(0)
  const charIndexRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const simulate = () => {
      const phrase = FAKE_PHRASES[phraseIndexRef.current % FAKE_PHRASES.length]
      const char = phrase[charIndexRef.current]

      if (!char) {
        // End of phrase - send final
        useStore.getState().addTranscriptItem({
          id: crypto.randomUUID(),
          text: phrase,
          isFinal: true,
          confidence: 1,
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        })
        useStore.getState().setInterimText("")
        phraseIndexRef.current++
        charIndexRef.current = 0
        return
      }

      charIndexRef.current++
      const interim = phrase.slice(0, charIndexRef.current)
      useStore.getState().setInterimText(interim)
    }

    intervalRef.current = setInterval(simulate, 150)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled])
}
