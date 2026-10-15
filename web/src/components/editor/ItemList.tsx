'use client'

import type { ReactNode } from 'react'
import type { ListOp } from '@/resume/listOps'
import { anchor } from '@/templates/anchors'
import { Button, IconButton } from '../ui/Button'
import { ConfirmIconButton } from '../ui/ConfirmButton'
import { ArrowDown, ArrowUp, Plus, Trash } from '../ui/icons'

/**
 * An editable list of records: each row gets move up / move down / remove controls,
 * and an "Add" button sits underneath. Every edit leaves as a `ListOp`.
 */
export function ItemList<T extends { id: string }>({
  items,
  noun,
  onOp,
  create,
  renderItem,
  describe,
  empty,
}: {
  items: T[]
  /** "entry", "link"… used in button labels. */
  noun: string
  onOp: (op: ListOp<T>) => void
  create: () => T
  renderItem: (item: T, update: (patch: Partial<Omit<T, 'id'>>) => void) => ReactNode
  /** Short name of an item for accessible labels, e.g. its title. */
  describe: (item: T) => string
  empty: string
}) {
  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-900/12 px-4 py-5 text-center text-[13px] text-zinc-400">{empty}</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {items.map((item, i) => {
            const name = describe(item).trim() || `${noun} ${i + 1}`
            return (
              <li key={item.id} {...anchor.item(item.id)} className="group/item rounded-xl bg-white p-3 ring-1 ring-zinc-900/8 transition-shadow duration-150 focus-within:ring-zinc-900/15 hover:ring-zinc-900/12">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-[11px] tracking-wide text-zinc-400 uppercase">
                    {noun} {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex items-center gap-0.5 opacity-60 transition-opacity group-focus-within/item:opacity-100 group-hover/item:opacity-100">
                    <IconButton label={`Move ${name} up`} disabled={i === 0} onClick={() => onOp({ op: 'move', id: item.id, delta: -1 })}>
                      <ArrowUp />
                    </IconButton>
                    <IconButton label={`Move ${name} down`} disabled={i === items.length - 1} onClick={() => onOp({ op: 'move', id: item.id, delta: 1 })}>
                      <ArrowDown />
                    </IconButton>
                    <ConfirmIconButton label={`Delete ${name}`} confirmLabel="Delete" onConfirm={() => onOp({ op: 'remove', id: item.id })}>
                      <Trash />
                    </ConfirmIconButton>
                  </div>
                </div>
                {renderItem(item, (patch) => onOp({ op: 'update', id: item.id, patch }))}
              </li>
            )
          })}
        </ol>
      )}
      <Button size="sm" variant="ghost" icon={<Plus />} className="self-start" onClick={() => onOp({ op: 'add', item: create() })}>
        Add {noun}
      </Button>
    </div>
  )
}
