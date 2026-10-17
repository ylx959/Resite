'use client'

import { useId, useRef, useState, type KeyboardEvent, type ToggleEvent } from 'react'
import { Check, ChevronDown } from './icons'

type A11y = { id?: string; 'aria-describedby'?: string; 'aria-invalid'?: true }

/**
 * A select whose list opens below the button (native pickers on macOS cover it instead).
 * Combobox + listbox pattern with focus kept on the button. The list is a popover in the top
 * layer, so scroll containers can't clip it, and Esc / click outside close it for free.
 */
export function Select<T extends string>({
  value,
  options,
  onChange,
  ...a11y
}: A11y & { value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  const listId = useId()
  const button = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const selected = Math.max(0, options.findIndex((o) => o.value === value))

  const hide = () => list.current?.hidePopover()
  const pick = (i: number) => {
    const option = options[i]
    if (option) onChange(option.value)
    hide()
  }

  // Pin the list under the button as it opens; it is `position: fixed`, so any scroll closes it.
  const beforeToggle = (e: ToggleEvent<HTMLUListElement>) => {
    if (e.newState !== 'open') return
    const rect = button.current!.getBoundingClientRect()
    Object.assign(e.currentTarget.style, { top: `${rect.bottom + 4}px`, left: `${rect.left}px`, minWidth: `${rect.width}px` })
    setActive(selected)
  }
  const toggle = (e: ToggleEvent<HTMLUListElement>) => {
    const isOpen = e.newState === 'open'
    setOpen(isOpen)
    if (isOpen) {
      window.addEventListener('scroll', hide, { capture: true, once: true })
      window.addEventListener('resize', hide, { once: true })
    } else {
      window.removeEventListener('scroll', hide, { capture: true })
      window.removeEventListener('resize', hide)
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1
    const move = { ArrowDown: Math.min(active + 1, last), ArrowUp: Math.max(active - 1, 0), Home: 0, End: last }[e.key]
    if (move !== undefined) {
      e.preventDefault()
      if (open) setActive(move)
      else list.current?.showPopover()
    } else if (open && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      pick(active)
    } else if (open && e.key === 'Tab') hide()
  }

  return (
    <>
      <button
        {...a11y}
        ref={button}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        popoverTarget={listId}
        onKeyDown={onKeyDown}
        className="inline-flex h-9 items-center justify-between gap-2 rounded-lg bg-white pr-2 pl-3 text-[14px] text-zinc-900 ring-1 ring-zinc-900/10 transition-[box-shadow] duration-150 hover:ring-zinc-900/20 focus:ring-2 focus:ring-accent/70 focus:outline-none"
      >
        {/* Every label in one grid cell, only the current one visible: the widest sets the width, so it never resizes. */}
        <span className="grid text-left">
          {options.map((option, i) => (
            <span key={option.value} aria-hidden={i !== selected} className={`col-start-1 row-start-1 ${i === selected ? '' : 'invisible'}`}>
              {option.label}
            </span>
          ))}
        </span>
        <ChevronDown className={`text-zinc-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      <ul
        ref={list}
        id={listId}
        role="listbox"
        popover="auto"
        onBeforeToggle={beforeToggle}
        onToggle={toggle}
        onMouseDown={(e) => e.preventDefault()} // keep focus on the button
        className="fixed inset-auto m-0 rounded-lg bg-white p-1 text-[14px] text-zinc-900 shadow-[0_8px_24px_-8px_rgb(24_24_27/0.2),0_0_0_1px_rgb(24_24_27/0.08)]"
      >
        {options.map((option, i) => (
          <li
            key={option.value}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === selected}
            onPointerEnter={() => setActive(i)}
            onClick={() => pick(i)}
            className={`flex h-8 cursor-default items-center gap-2 rounded-md pr-3 pl-2 select-none ${i === active ? 'bg-zinc-900/6' : ''}`}
          >
            <Check className={i === selected ? 'text-accent' : 'invisible'} />
            {option.label}
          </li>
        ))}
      </ul>
    </>
  )
}
