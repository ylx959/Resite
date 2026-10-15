'use client'

import { useState, type ReactNode } from 'react'
import { safeImageSrc } from '@/utils/url'
import { Button } from '../ui/Button'

/**
 * Upload an image (processed by `process` and stored inside the resume) or paste
 * an image URL. `placeholder` shows in the thumbnail when the value is empty.
 */
export function ImageField({
  label,
  value,
  onChange,
  process,
  placeholder,
  round = false,
  helper,
  className = '',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  process: (file: File) => Promise<string>
  placeholder: ReactNode
  round?: boolean
  helper?: string
  className?: string
}) {
  const [error, setError] = useState<string>()
  const uploaded = value.startsWith('data:')
  const preview = safeImageSrc(value)

  const upload = async (file: File | undefined) => {
    if (!file) return
    try {
      onChange(await process(file))
      setError(undefined)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read this image.')
    }
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <div className="flex items-center gap-3">
        <span
          className={`grid size-9 shrink-0 place-items-center overflow-hidden bg-zinc-100 text-zinc-400 ring-1 ring-zinc-900/8 ${
            round ? 'rounded-full' : 'rounded-lg'
          }`}
        >
          {preview ? (
            <img src={preview} alt="" className={round ? 'size-full object-cover' : 'max-h-5 max-w-6 object-contain'} />
          ) : (
            placeholder
          )}
        </span>
        {uploaded ? (
          <span className="flex-1 text-[13px] text-zinc-500">Uploaded image</span>
        ) : (
          <input
            aria-label={`${label} URL`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Image URL, or upload"
            inputMode="url"
            className="h-9 min-w-0 flex-1 rounded-lg bg-white px-3 text-[14px] ring-1 ring-zinc-900/10 placeholder:text-zinc-400 hover:ring-zinc-900/20 focus:ring-2 focus:ring-accent/70 focus:outline-none"
          />
        )}
        <label className="inline-flex h-8 shrink-0 cursor-pointer items-center rounded-lg bg-accent/8 px-3 text-[13px] font-medium text-accent ring-1 ring-accent/35 ring-inset transition-[background-color,box-shadow,scale] hover:bg-accent/16 hover:ring-accent/60 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent active:scale-[0.98] active:bg-accent/22">
          Upload
          <input
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            className="sr-only"
            onChange={(e) => {
              void upload(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </label>
        {value && (
          <Button size="sm" variant="ghost" onClick={() => onChange('')}>
            {uploaded ? 'Remove' : 'Clear'}
          </Button>
        )}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : helper && <p className="text-xs text-zinc-400">{helper}</p>}
    </div>
  )
}
