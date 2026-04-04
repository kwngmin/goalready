'use client'

import { useState, useRef } from 'react'

interface PhotoUploaderProps {
  onUpload: (urls: string[]) => void
}

export function PhotoUploader({ onUpload }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [previews, setPreviews] = useState<{ url: string; uploaded: string }[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList) => {
    setUploading(true)
    const newPreviews: { url: string; uploaded: string }[] = []

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        newPreviews.push({
          url: URL.createObjectURL(file),
          uploaded: data.url,
        })
      }
    }

    const updated = [...previews, ...newPreviews]
    setPreviews(updated)
    onUpload(updated.map((p) => p.uploaded))
    setUploading(false)
  }

  const removePhoto = (index: number) => {
    const updated = previews.filter((_, i) => i !== index)
    setPreviews(updated)
    onUpload(updated.map((p) => p.uploaded))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {previews.map((preview, i) => (
          <div key={i} className="relative h-24 w-24 overflow-hidden rounded-md border">
            <img src={preview.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-xs text-white"
            >
              &times;
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex h-24 w-24 items-center justify-center rounded-md border-2 border-dashed border-zinc-300 text-zinc-400 hover:border-zinc-400 hover:text-zinc-500"
        >
          {uploading ? '...' : '+'}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  )
}
