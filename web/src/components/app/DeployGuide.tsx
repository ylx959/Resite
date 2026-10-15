'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { deployNotes, deploySteps } from '@/content/deployGuide'
import { IconButton } from '../ui/Button'
import { Close, ExternalArrow } from '../ui/icons'

/** Step-by-step Vercel instructions in a side sheet (native `<dialog>`: focus trap and Esc for free). */
export function DeployGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [width, setWidth] = useSheetWidth()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-labelledby="deploy-title"
      style={{ width }}
      className="m-0 ml-auto h-[100dvh] max-h-none max-w-full bg-paper p-0 text-zinc-900 shadow-[0_0_0_1px_rgb(24_24_27/0.08),-24px_0_48px_-24px_rgb(24_24_27/0.25)] backdrop:bg-zinc-900/20 backdrop:backdrop-blur-[2px] open:animate-[sheet-in_320ms_cubic-bezier(0.16,1,0.3,1)]"
    >
      <SheetResizer width={width} onResize={setWidth} />
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-zinc-900/8 px-6 pt-6 pb-5">
          <div>
            <h2 id="deploy-title" className="text-lg font-semibold tracking-tight">
              Put your resume online
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">Free, about five minutes, no coding. Your site, your Vercel account.</p>
          </div>
          <IconButton label="Close guide" onClick={onClose}>
            <Close />
          </IconButton>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <ol className="relative flex flex-col gap-7">
            {deploySteps.map((step, i) => (
              <li key={step.title} className="relative grid grid-cols-[1.75rem_1fr] gap-x-3">
                {i < deploySteps.length - 1 && <span aria-hidden="true" className="absolute top-8 bottom-[-1.5rem] left-[0.8125rem] w-px bg-zinc-900/10" />}
                <span className="grid size-7 place-items-center rounded-full bg-zinc-900 font-mono text-xs text-paper">{i + 1}</span>
                <div className="pt-0.5">
                  <h3 className="text-[14px] font-medium">{step.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-zinc-600">{step.body}</p>
                  {step.link && (
                    <a
                      href={step.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-zinc-900 underline decoration-zinc-900/20 underline-offset-2 hover:decoration-zinc-900"
                    >
                      {step.link.label}
                      <ExternalArrow className="text-zinc-400" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <ul className="mt-10 flex flex-col gap-2 border-t border-zinc-900/8 pt-6">
            {deployNotes.map((note) => (
              <li key={note} className="text-[13px] leading-relaxed text-zinc-500">
                <InlineCode text={note} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </dialog>
  )
}

const KEY = 'resume-creator:guide-width'
const DEFAULT_WIDTH = 448
const MIN_WIDTH = 360

const clampWidth = (w: number) => Math.round(Math.max(MIN_WIDTH, Math.min(w, 1100, window.innerWidth - 48)))

/** Sheet width, remembered per browser. A viewing preference only, so storage failures are ignored. */
function useSheetWidth() {
  const [width, setWidth] = useState(DEFAULT_WIDTH)

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(KEY))
      if (saved) setWidth(clampWidth(saved))
    } catch {}
  }, [])

  const update = (w: number) => {
    const next = clampWidth(w)
    setWidth(next)
    try {
      localStorage.setItem(KEY, String(next))
    } catch {}
  }

  return [width, update] as const
}

/** The sheet's left edge: drag to resize, arrow keys in 24px steps, double-click to reset. */
function SheetResizer({ width, onResize }: { width: number; onResize: (width: number) => void }) {
  const dragging = useRef(false)

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging.current = true
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) onResize(window.innerWidth - e.clientX)
  }
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 96 : 24
    if (e.key === 'ArrowLeft') onResize(width + step)
    else if (e.key === 'ArrowRight') onResize(width - step)
    else return
    e.preventDefault()
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize guide"
      aria-valuenow={width}
      tabIndex={0}
      title="Drag to resize · double-click to reset"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      onDoubleClick={() => onResize(DEFAULT_WIDTH)}
      onKeyDown={onKeyDown}
      className="group absolute inset-y-0 left-0 z-10 hidden w-2 cursor-col-resize touch-none focus-visible:outline-none sm:block"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-px transition-[background-color,width] duration-150 group-hover:w-0.5 group-hover:bg-zinc-900/25 group-focus-visible:w-0.5 group-focus-visible:bg-accent group-active:w-0.5 group-active:bg-accent"
      />
    </div>
  )
}

/** Renders `backtick` spans as code. */
function InlineCode({ text }: { text: string }) {
  return text.split(/(`[^`]+`)/).map((part, i) =>
    part.startsWith('`') ? (
      <code key={i} className="rounded bg-zinc-900/6 px-1 py-0.5 font-mono text-[12px] text-zinc-800">
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  )
}
