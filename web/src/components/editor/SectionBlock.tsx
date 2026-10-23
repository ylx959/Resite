'use client'

import { useId, useState } from 'react'
import { useDispatch } from '@/hooks/EditorContext'
import { sectionKinds } from '@/resume/sectionKinds'
import { anchor } from '@/templates/anchors'
import type { Section } from '@/types/resume'
import { IconButton } from '../ui/Button'
import { ConfirmIconButton } from '../ui/ConfirmButton'
import { TextField } from '../ui/Field'
import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, Trash } from '../ui/icons'
import { Collapsible } from './Collapsible'
import { SectionContent } from './SectionContent'

const countLabel = (section: Section) => {
  if (section.kind === 'text') return section.body.trim() ? `${section.body.trim().split(/\s+/).length} words` : 'Empty'
  const n = section.items.length
  const { itemNoun, itemNounPlural } = sectionKinds[section.kind]
  return n === 0 ? 'Empty' : `${n} ${n === 1 ? itemNoun : itemNounPlural}`
}

/** One section in the editor: a header row with its controls, and a collapsible body. */
export function SectionBlock({
  section,
  index,
  count,
  defaultOpen = false,
}: {
  section: Section
  index: number
  count: number
  defaultOpen?: boolean
}) {
  const dispatch = useDispatch()
  const [open, setOpen] = useState(defaultOpen)
  const bodyId = useId()
  const name = section.title || 'Untitled section'

  return (
    <section className="border-t border-zinc-900/8 first:border-t-0" aria-label={name} {...anchor.section(section.id)}>
      <div className="flex items-center gap-1 py-2 pr-1">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen(!open)}
          className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg py-2 pr-2 pl-1 text-left focus-visible:outline-2 focus-visible:outline-accent"
        >
          <ChevronDown className={`shrink-0 text-zinc-400 transition-transform duration-200 group-hover:text-zinc-700 ${open ? '' : '-rotate-90'}`} />
          <span className="min-w-0 flex-1">
            <span className={`block truncate text-[15px] font-medium tracking-tight ${section.visible ? 'text-zinc-900' : 'text-zinc-400 line-through decoration-zinc-300'}`}>
              {name}
            </span>
            <span className="block text-xs text-zinc-400">
              {sectionKinds[section.kind].label} · {countLabel(section)}
              {!section.visible && ' · Hidden'}
            </span>
          </span>
        </button>
        <IconButton
          label={section.visible ? `Hide ${name}` : `Show ${name}`}
          aria-pressed={!section.visible}
          onClick={() => dispatch({ type: 'section', id: section.id, patch: { visible: !section.visible } })}
        >
          {section.visible ? <Eye /> : <EyeOff />}
        </IconButton>
        <IconButton label={`Move ${name} up`} disabled={index === 0} onClick={() => dispatch({ type: 'sections', op: { op: 'move', id: section.id, delta: -1 } })}>
          <ArrowUp />
        </IconButton>
        <IconButton label={`Move ${name} down`} disabled={index === count - 1} onClick={() => dispatch({ type: 'sections', op: { op: 'move', id: section.id, delta: 1 } })}>
          <ArrowDown />
        </IconButton>
        <ConfirmIconButton label={`Delete ${name}`} confirmLabel="Delete" onConfirm={() => dispatch({ type: 'sections', op: { op: 'remove', id: section.id } })}>
          <Trash />
        </ConfirmIconButton>
      </div>
      <Collapsible open={open} id={bodyId}>
        <div className="flex flex-col gap-4 pt-1 pb-6 pl-8">
          <TextField
            label="Section title"
            value={section.title}
            onChange={(title) => dispatch({ type: 'section', id: section.id, patch: { title } })}
            helper="Shown as the heading. Leave empty for no heading."
            {...anchor('title')}
          />
          <SectionContent section={section} />
        </div>
      </Collapsible>
    </section>
  )
}
