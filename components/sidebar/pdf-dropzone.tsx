import { useState, useCallback, useRef } from "react"
import { Upload, FileText, X } from "lucide-react"

export function PdfDropzone() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File | null) => {
    if (file?.type === "application/pdf") {
      setUploadedFile(file.name)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file ?? null)
  }, [handleFile])

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      handleFile(file ?? null)
      e.target.value = ""
    },
    [handleFile]
  )

  return (
    <div className="px-6 py-5">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
        Syllabus Context
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />
      {uploadedFile ? (
        <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 transition-colors hover:border-slate-600">
          <FileText
            className="h-5 w-5 shrink-0 text-amber-400"
            aria-hidden="true"
          />
          <span className="truncate text-sm text-slate-300">
            {uploadedFile}
          </span>
          <button
            type="button"
            onClick={() => setUploadedFile(null)}
            className="ml-auto shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="Remove uploaded file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              handleClick()
            }
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all duration-200 ${
            isDragOver
              ? "border-amber-500/60 bg-amber-500/10 scale-[1.01]"
              : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/40"
          }`}
          aria-label="Drop syllabus PDF here or click to browse"
        >
          <Upload
            className={`mb-3 h-8 w-8 transition-colors ${isDragOver ? "text-amber-400" : "text-slate-600"}`}
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-slate-300">
            Drop PDF or click to upload
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Improves accuracy for technical terms
          </p>
        </div>
      )}
    </div>
  )
}
