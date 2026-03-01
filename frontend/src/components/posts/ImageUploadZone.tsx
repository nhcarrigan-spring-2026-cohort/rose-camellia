import { useRef } from 'react'
import { Upload, X } from 'lucide-react'

interface ImageUploadZoneProps {
  files: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
}

export default function ImageUploadZone({ files, onChange, maxFiles = 5 }: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function processFiles(incoming: FileList | null) {
    if (!incoming) return
    const valid = Array.from(incoming).filter(
      (f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024
    )
    const combined = [...files, ...valid].slice(0, maxFiles)
    onChange(combined)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    processFiles(e.dataTransfer.files)
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div
        className="border-2 border-dashed border-amber-300 rounded-xl p-6 bg-amber-50 hover:bg-amber-100 cursor-pointer text-center transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-8 w-8 mx-auto text-amber-400 mb-2" />
        <p className="text-sm text-amber-700 font-medium">Drag & drop images here</p>
        <p className="text-xs text-amber-500 mt-1">
          or click to browse · max {maxFiles} images · 5 MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, i) => (
            <div key={i} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-20 w-20 object-cover rounded-lg border border-amber-200"
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
