import { useState, useCallback } from "react"
import { Upload, FileText, X } from "lucide-react"

export function PdfDropzone() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type === "application/pdf") {
      setUploadedFile(file.name)
    }
  }, [])

  return (
    <div className="px-6 py-5">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
        Syllabus Context
      </p>
      {uploadedFile ? (
        <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
          <FileText
            className="h-5 w-5 shrink-0 text-yellow-500"
            aria-hidden="true"
          />
          <span className="truncate text-sm text-slate-300">
            {uploadedFile}
          </span>
          <button
            type="button"
            onClick={() => setUploadedFile(null)}
            className="ml-auto shrink-0 rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-300"
            aria-label="Remove uploaded file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
            }
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
            isDragOver
              ? "border-yellow-500/50 bg-yellow-500/5"
              : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/30"
          }`}
          aria-label="Drop syllabus PDF here for upload"
        >
          <Upload
            className={`mb-3 h-8 w-8 ${isDragOver ? "text-yellow-500" : "text-slate-600"}`}
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-slate-300">
            Drop Syllabus PDF Here
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Contextualizes AI for better accuracy
          </p>
        </div>
      )}
    </div>
  )
}
