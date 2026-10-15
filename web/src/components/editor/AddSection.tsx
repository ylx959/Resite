'use client'

import { useState } from 'react'
import { createSection, sectionKindOrder, sectionKinds } from '@/resume/sectionKinds'
import type { Section } from '@/types/resume'
import { Button } from '../ui/Button'
import { Plus } from '../ui/icons'
import { Collapsible } from './Collapsible'

/** "Add section": pick a kind, get a new section at the end. */
export function AddSection({ onAdd }: { onAdd: (section: Section) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl border border-dashed border-zinc-900/15 p-2">
      <Button variant="ghost" icon={<Plus />} aria-expanded={open} aria-controls="add-section-kinds" className="w-full justify-start" onClick={() => setOpen(!open)}>
        Add section
      </Button>
      <Collapsible open={open} id="add-section-kinds">
        <ul className="grid grid-cols-1 gap-1 p-1 pt-2 sm:grid-cols-2">
          {sectionKindOrder.map((kind) => (
            <li key={kind}>
              <button
                type="button"
                onClick={() => {
                  onAdd(createSection(kind, kind === 'text' ? 'About' : 'New section'))
                  setOpen(false)
                }}
                className="w-full rounded-xl px-3 py-2.5 text-left transition-[background-color,scale] duration-150 hover:bg-zinc-900/5 focus-visible:outline-2 focus-visible:outline-accent active:scale-[0.98]"
              >
                <span className="block text-[13px] font-medium text-zinc-900">{sectionKinds[kind].label}</span>
                <span className="block text-xs text-zinc-500">{sectionKinds[kind].description}</span>
              </button>
            </li>
          ))}
        </ul>
      </Collapsible>
    </div>
  )
}
