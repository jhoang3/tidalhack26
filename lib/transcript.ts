export interface TranscriptSegment {
  id: number
  text: string
  keywords: string[]
  timestamp: string
}

export const MOCK_TRANSCRIPT: TranscriptSegment[] = [
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

export const MOCK_KEYWORDS = [
  "Eigenvalues",
  "Stochastic",
  "Navier-Stokes",
  "Lagrangian",
  "Fourier Transform",
  "Gradient Descent",
  "Bayesian",
  "Hessian Matrix",
]
