'use client'

import { useId, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject, type ToggleEvent } from 'react'

type Hsv = { h: number; s: number; v: number }

const PRESETS = ['#ff4a00', '#e11d48', '#c026d3', '#7c3aed', '#2563eb', '#0891b2', '#059669', '#18181b']

/** h 0–360, s and v 0–1 → `#rrggbb`. */
function hsvToHex({ h, s, v }: Hsv): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255)
  }
  return `#${[f(5), f(3), f(1)].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

function hexToHsv(hex: string): Hsv {
  const n = parseInt(hex.slice(1, 7), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const d = max - Math.min(r, g, b)
  let h = 0
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max }
}

const clamp = (n: number) => Math.min(1, Math.max(0, n))

/**
 * A swatch button whose panel opens below `anchor` (native pickers on macOS cover the field instead).
 * Same popover approach as `Select`: top layer, Esc / click outside close it, any scroll closes it.
 */
export function ColorPicker({
  value,
  onChange,
  anchor,
  label,
}: {
  value: string
  onChange: (hex: string) => void
  anchor: RefObject<HTMLElement | null>
  label: string
}) {
  const panelId = useId()
  const panel = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  // Hue lives here, not in the hex: dragging to grey or black would otherwise lose it.
  const [hsv, setHsv] = useState(() => hexToHsv(value))
  if (hsvToHex(hsv) !== value) setHsv(hexToHsv(value))

  const set = (next: Hsv) => {
    setHsv(next)
    const hex = hsvToHex(next)
    if (hex !== value) onChange(hex)
  }

  const hide = () => panel.current?.hidePopover()

  // The panel has no size until it is shown, so placement uses the size from its last opening
  // (first time: the w-56 panel's laid-out size). It is placed once, before it shows, and never moved.
  const size = useRef({ width: 224, height: 221 })

  // Below the field; flipped above when it would run off the bottom of the window. Above is pinned
  // by `bottom`, so the field edge it hugs doesn't depend on the measured height.
  const beforeToggle = (e: ToggleEvent<HTMLDivElement>) => {
    if (e.newState !== 'open') return
    const rect = anchor.current!.getBoundingClientRect()
    const { width, height } = size.current
    const flip = rect.bottom + 6 + height > innerHeight - 8 && rect.top - 6 - height >= 8
    const left = Math.max(8, Math.min(rect.left, innerWidth - width - 8))
    Object.assign(e.currentTarget.style, {
      top: flip ? 'auto' : `${rect.bottom + 6}px`,
      bottom: flip ? `${document.documentElement.clientHeight - rect.top + 6}px` : 'auto',
      left: `${left}px`,
    })
  }
  const toggle = (e: ToggleEvent<HTMLDivElement>) => {
    const isOpen = e.newState === 'open'
    setOpen(isOpen)
    if (isOpen) {
      size.current = { width: e.currentTarget.offsetWidth, height: e.currentTarget.offsetHeight }
      window.addEventListener('scroll', hide, { capture: true, once: true })
      window.addEventListener('resize', hide, { once: true })
    } else {
      window.removeEventListener('scroll', hide, { capture: true })
      window.removeEventListener('resize', hide)
    }
  }

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    set({ h: hsv.h, s: clamp((e.clientX - rect.left) / rect.width), v: 1 - clamp((e.clientY - rect.top) / rect.height) })
  }
  const onAreaKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 0.1 : 0.01
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowDown: [0, -step],
      ArrowUp: [0, step],
    }
    const move = moves[e.key]
    if (!move) return
    e.preventDefault()
    set({ h: hsv.h, s: clamp(hsv.s + move[0]), v: clamp(hsv.v + move[1]) })
  }

  return (
    <>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        popoverTarget={panelId}
        style={{ backgroundColor: value }}
        className="size-6 shrink-0 cursor-pointer rounded-md shadow-[inset_0_0_0_1px_rgb(24_24_27/0.12)] transition-transform duration-150 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
      <div
        ref={panel}
        id={panelId}
        role="dialog"
        aria-label={label}
        popover="auto"
        onBeforeToggle={beforeToggle}
        onToggle={toggle}
        className="fixed inset-auto m-0 w-56 rounded-xl bg-white p-3 shadow-[0_8px_24px_-8px_rgb(24_24_27/0.2),0_0_0_1px_rgb(24_24_27/0.08)]"
      >
        <div
          role="slider"
          tabIndex={0}
          aria-label="Saturation and brightness"
          aria-valuetext={`Saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`}
          onPointerDown={(e) => {
            e.preventDefault()
            e.currentTarget.focus()
            e.currentTarget.setPointerCapture(e.pointerId)
            fromPointer(e)
          }}
          onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && fromPointer(e)}
          onKeyDown={onAreaKeyDown}
          style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h} 100% 50%))` }}
          className="relative h-32 cursor-crosshair touch-none rounded-lg shadow-[inset_0_0_0_1px_rgb(24_24_27/0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span
            style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, backgroundColor: value }}
            className="pointer-events-none absolute size-3.5 -translate-1/2 rounded-full shadow-[0_0_0_2px_#fff,0_1px_4px_1px_rgb(0_0_0/0.3)]"
          />
        </div>
        <input
          type="range"
          aria-label="Hue"
          min={0}
          max={359}
          value={Math.round(hsv.h)}
          onChange={(e) => set({ ...hsv, h: Number(e.target.value) })}
          className="mt-3 block h-3 w-full cursor-pointer appearance-none rounded-full bg-[linear-gradient(to_right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-transparent [&::-moz-range-thumb]:shadow-[0_1px_4px_1px_rgb(0_0_0/0.3)] [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_1px_4px_1px_rgb(0_0_0/0.3)]"
        />
        <div className="mt-3 grid grid-cols-8 gap-1.5 border-t border-zinc-900/6 pt-3">
          {PRESETS.map((hex) => (
            <button
              key={hex}
              type="button"
              aria-label={hex}
              aria-pressed={hex === value}
              onClick={() => onChange(hex)}
              style={{ backgroundColor: hex }}
              className={`aspect-square cursor-pointer rounded-md shadow-[inset_0_0_0_1px_rgb(24_24_27/0.12)] transition-transform duration-150 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${hex === value ? 'ring-2 ring-zinc-900/70 ring-offset-1' : ''}`}
            />
          ))}
        </div>
      </div>
    </>
  )
}
