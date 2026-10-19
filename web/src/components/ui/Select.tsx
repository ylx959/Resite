'use client'

import { useId, useRef, useState, type KeyboardEvent, type ToggleEvent } from 'react'
import { ChevronUpDown } from './icons'

type A11y = { id?: string; 'aria-describedby'?: string; 'aria-invalid'?: true }

const trigger =
  'flex h-9 items-center justify-between gap-2 rounded-[10px] bg-white pr-2 pl-3 text-[14px] text-zinc-900 shadow-[0_1px_2px_rgb(24_24_27/0.06)]'

/**
 * A select whose panel grows out of the button: the list opens in a gray panel laid over the
 * button, with a copy of the button as its top row. Combobox + listbox pattern with focus kept on
 * the button. The panel is a popover in the top layer, so scroll containers can't clip it, and
 * Esc / click outside close it for free.
 */
export function Select<T extends string>({
  value,
  options,
  onChange,
  ...a11y
}: A11y & { value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  const listId = useId()
  const button = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const selected = Math.max(0, options.findIndex((o) => o.value === value))

  const hide = () => panel.current?.hidePopover()
  const pick = (i: number) => {
    const option = options[i]
    if (option) onChange(option.value)
    hide()
  }

  // Pin the panel so its top row sits exactly over the button (p-1 = 4px); it is `position: fixed`, so any scroll closes it.
  const beforeToggle = (e: ToggleEvent<HTMLDivElement>) => {
    if (e.newState !== 'open') return
    const rect = button.current!.getBoundingClientRect()
    Object.assign(e.currentTarget.style, { top: `${rect.top - 4}px`, left: `${rect.left - 4}px`, minWidth: `${rect.width + 8}px` })
    setActive(selected)
  }
  const toggle = (e: ToggleEvent<HTMLDivElement>) => {
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
      else panel.current?.showPopover()
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
        popoverTarget={`${listId}-panel`}
        onKeyDown={onKeyDown}
        className={`${trigger} ring-1 ring-zinc-900/10 transition-[box-shadow] duration-150 hover:ring-zinc-900/20 focus:ring-2 focus:ring-accent/70 focus:outline-none`}
      >
        {/* Every label in one grid cell, only the current one visible: the widest sets the width, so it never resizes. */}
        <span className="grid text-left">
          {options.map((option, i) => (
            <span key={option.value} aria-hidden={i !== selected} className={`col-start-1 row-start-1 ${i === selected ? '' : 'invisible'}`}>
              {option.label}
            </span>
          ))}
        </span>
        <ChevronUpDown className="text-zinc-500" />
      </button>
      <div
        ref={panel}
        id={`${listId}-panel`}
        popover="auto"
        onBeforeToggle={beforeToggle}
        onToggle={toggle}
        onMouseDown={(e) => e.preventDefault()} // keep focus on the button
        className="fixed inset-auto m-0 origin-top rounded-[14px] bg-[#ebebeb] p-1 text-[14px] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.7),0_0_0_1px_rgb(24_24_27/0.06),0_12px_28px_-10px_rgb(24_24_27/0.25)] -translate-y-1 scale-95 opacity-0 transition-[opacity,scale,translate,display,overlay] transition-discrete duration-250 ease-out open:translate-y-0 open:scale-100 open:opacity-100 starting:open:-translate-y-1 starting:open:scale-95 starting:open:opacity-0"
      >
        {/* Copy of the button; the real one is underneath, so clicking here just closes. */}
        <div aria-hidden="true" onClick={hide} className={`${trigger} mb-1 w-full`}>
          {options[selected]?.label}
          <ChevronUpDown className="text-zinc-500" />
        </div>
        <ul id={listId} role="listbox">
          {options.map((option, i) => (
            <li
              key={option.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === selected}
              onPointerEnter={() => setActive(i)}
              onClick={() => pick(i)}
              className={`flex h-8 cursor-default items-center justify-between gap-3 rounded-[10px] pr-3 pl-3 select-none ${
                i === active ? 'bg-zinc-900/8 text-zinc-900' : i === selected ? 'text-zinc-900' : 'text-zinc-500'
              }`}
            >
              {option.label}
              <span className={`size-1.5 rounded-full bg-accent ${i === selected ? '' : 'invisible'}`} />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
