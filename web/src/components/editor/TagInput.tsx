'use client'

import { useId, useState, type KeyboardEvent } from 'react'
import { Close } from '../ui/icons'

/** Chips you add with Enter or comma and remove with × or Backspace. Pasting "a, b, c" adds three. */
export function TagInput({ label, tags, onChange }: { label: string; tags: string[]; onChange: (tags: string[]) => void }) {
  const id = useId()
  const [draft, setDraft] = useState('')

  const commit = (text: string) => {
    const added = text
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t && !tags.includes(t))
    if (added.length > 0) onChange([...tags, ...added])
    setDraft('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && draft.trim()) {
      e.preventDefault()
      commit(draft)
    } else if (e.key === 'Backspace' && !draft && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-zinc-500">
        {label}
      </label>
      <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg bg-white p-1.5 ring-1 ring-zinc-900/10 transition-shadow focus-within:ring-2 focus-within:ring-accent/70 hover:ring-zinc-900/20">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex h-6 items-center gap-0.5 rounded-md border border-zinc-900/20 pr-0.5 pl-2 text-[13px] text-zinc-800">
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="grid size-5 place-items-center rounded text-zinc-400 hover:bg-zinc-900/6 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-accent"
            >
              <Close width={12} height={12} />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => (e.target.value.includes(',') ? commit(e.target.value) : setDraft(e.target.value))}
          onKeyDown={onKeyDown}
          onBlur={() => draft.trim() && commit(draft)}
          placeholder={tags.length === 0 ? 'Type and press Enter' : 'Add…'}
          className="h-6 min-w-24 flex-1 bg-transparent px-1 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
        />
      </div>
    </div>
  )
}
