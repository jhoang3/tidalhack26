"use client"

import React from "react"

import { useRef, useEffect } from "react"

interface TranscriptSegment {
  id: number
  text: string
  keywords: string[]
  timestamp: string
}

const MOCK_TRANSCRIPT: TranscriptSegment[] = [
  {
    id: 1,
    text: "Good morning, everyone. Today we're going to continue our discussion on fluid dynamics and specifically the mathematical foundations that govern turbulent flow.",
    keywords: [],
    timestamp: "00:00:12",
  },
  {
    id: 2,
    text: "Recall from last lecture that the Navier-Stokes equations describe the motion of viscous fluid substances. These are fundamental partial differential equations in the field.",
    keywords: ["Navier-Stokes"],
    timestamp: "00:00:38",
  },
  {
    id: 3,
    text: "The key challenge with turbulence is that it's inherently stochastic in nature. We can model the mean flow, but the fluctuations require statistical treatment.",
    keywords: ["stochastic"],
    timestamp: "00:01:15",
  },
  {
    id: 4,
    text: "Let's look at the eigenvalues of the Reynolds stress tensor. These give us the principal stresses and tell us about the shape of the turbulence — whether it's rod-like, disc-like, or spherical.",
    keywords: ["eigenvalues"],
    timestamp: "00:01:52",
  },
  {
    id: 5,
    text: "Now, to analyze this properly, we apply a Fourier Transform to decompose the velocity field into its frequency components. This is where the energy spectrum comes in.",
    keywords: ["Fourier Transform"],
    timestamp: "00:02:30",
  },
  {
    id: 6,
    text: "The Lagrangian framework tracks individual fluid particles as they move through the flow field. This is in contrast to the Eulerian approach we discussed previously.",
    keywords: ["Lagrangian"],
    timestamp: "00:03:08",
  },
  {
    id: 7,
    text: "For the computational side, we'll be using gradient descent optimization to minimize the error between our simulated and experimental data across the mesh.",
    keywords: ["gradient descent"],
    timestamp: "00:03:45",
  },
  {
    id: 8,
    text: "A Bayesian approach allows us to incorporate prior knowledge about the flow parameters and update our estimates as we gather more experimental measurements.",
    keywords: ["Bayesian"],
    timestamp: "00:04:22",
  },
]

const INTERIM_TEXT =
  "The Hessian matrix of the cost function gives us second-order information about the curvature of the optimization landscape, which helps us..."

function highlightKeywords(text: string, keywords: string[]) {
  if (keywords.length === 0) return <span>{text}</span>

  const parts: React.ReactNode[] = []
  let remaining = text

  for (const keyword of keywords) {
    const regex = new RegExp(`(${keyword})`, "gi")
    const match = remaining.match(regex)
    if (match) {
      const idx = remaining.toLowerCase().indexOf(keyword.toLowerCase())
      if (idx > 0) {
        parts.push(remaining.slice(0, idx))
      }
      parts.push(
        <mark
          key={`${keyword}-${idx}`}
          className="rounded bg-transparent font-semibold text-yellow-400"
        >
          {remaining.slice(idx, idx + keyword.length)}
        </mark>
      )
      remaining = remaining.slice(idx + keyword.length)
    }
  }

  if (remaining) {
    parts.push(remaining)
  }

  return <>{parts}</>
}

export function TranscriptView() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-6 py-8 md:px-12 lg:px-20"
      role="log"
      aria-label="Live transcript"
      aria-live="polite"
    >
      <div className="mx-auto max-w-3xl">
        {/* Session header */}
        <div className="mb-8">
          <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
            Live Session
          </h2>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
            Advanced Fluid Dynamics — Lecture 14
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Prof. A. Reynolds &middot; Feb 7, 2026 &middot; 10:00 AM
          </p>
        </div>

        {/* Transcript segments */}
        <div className="space-y-6">
          {MOCK_TRANSCRIPT.map((segment) => (
            <div key={segment.id} className="group">
              <span className="mb-1 block text-xs tabular-nums text-slate-600">
                {segment.timestamp}
              </span>
              <p className="text-lg leading-relaxed text-slate-50">
                {highlightKeywords(segment.text, segment.keywords)}
              </p>
            </div>
          ))}

          {/* Interim / predictive text */}
          <div className="group">
            <span className="mb-1 block text-xs tabular-nums text-slate-600">
              00:04:58
            </span>
            <p className="text-lg leading-relaxed">
              <span className="text-slate-50">
                {highlightKeywords("The Hessian matrix", ["Hessian matrix"])}
              </span>
              <span className="text-slate-500">
                {" "}
                of the cost function gives us second-order information about the
                curvature of the optimization landscape, which helps us...
              </span>
              <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-yellow-500" aria-hidden="true" />
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
