/**
 * API configuration for LectureBridge.
 * Set VITE_API_URL in .env (e.g. http://localhost:8000)
 */
const getApiBase = () => {
  return import.meta.env.VITE_API_URL ?? "http://localhost:8000"
}

export const getUploadUrl = () => `${getApiBase()}/upload`
export const getWebSocketUrl = (sessionId: string) => {
  const base = getApiBase().replace(/^http/, "ws")
  return `${base}/listen?session_id=${sessionId}`
}
