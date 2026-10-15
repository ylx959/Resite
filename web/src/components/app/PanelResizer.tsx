'use client'

import { useRef, type KeyboardEvent, type PointerEvent, type RefObject } from 'react'
import { clampPanel, PANEL_DEFAULT, PANEL_MIN, panelMax } from '@/hooks/useEditorPanel'

/** Dragging past this (narrower than the minimum) collapses the panel on release. */
const COLLAPSE_BELOW = PANEL_MIN - 120

/**
 * The editor panel's right edge. Drag to resize, arrow keys for 24px steps,
 * double-click to reset. While dragging it writes `--editor-w` straight onto
 * `shell` — no React re-render per pixel — and commits once on release.
 */
export function PanelResizer({
  shell,
  width,
  onResize,
  onCollapse,
}: {
  shell: RefObject<HTMLElement | null>
  width: number
  onResize: (width: number) => void
  onCollapse: () => void
}) {
  const drag = useRef<{ startX: number; startWidth: number; width: number } | null>(null)

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { startX: e.clientX, startWidth: width, width }
    // The preview iframe would swallow pointer events mid-drag.
    shell.current?.setAttribute('data-resizing', '')
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    d.width = d.startWidth + e.clientX - d.startX
    shell.current?.style.setProperty('--editor-w', `${clampPanel(d.width, window.innerWidth)}px`)
    shell.current?.toggleAttribute('data-collapsing', d.width < COLLAPSE_BELOW)
  }

  const onPointerUp = () => {
    const d = drag.current
    if (!d) return
    drag.current = null
    shell.current?.removeAttribute('data-resizing')
    shell.current?.removeAttribute('data-collapsing')
    shell.current?.style.removeProperty('--editor-w')
    if (d.width < COLLAPSE_BELOW) onCollapse()
    else onResize(d.width)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 96 : 24
    if (e.key === 'ArrowLeft') onResize(width - step)
    else if (e.key === 'ArrowRight') onResize(width + step)
    else if (e.key === 'Home') onResize(PANEL_MIN)
    else if (e.key === 'End') onResize(panelMax(window.innerWidth))
    else return
    e.preventDefault()
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize editor"
      aria-valuenow={width}
      aria-valuemin={PANEL_MIN}
      tabIndex={0}
      title="Drag to resize · double-click to reset"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={() => onResize(PANEL_DEFAULT)}
      onKeyDown={onKeyDown}
      className="group relative z-10 -mx-1.5 hidden w-3 shrink-0 cursor-col-resize touch-none focus-visible:outline-none lg:block"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-zinc-900/8 transition-[background-color,width] duration-150 group-hover:w-0.5 group-hover:bg-zinc-900/25 group-focus-visible:w-0.5 group-focus-visible:bg-accent group-active:w-0.5 group-active:bg-accent"
      />
    </div>
  )
}

/** The collapsed editor: a vertical capsule on the left edge of the preview canvas. */
export function CollapsedPanel({ onExpand, icon }: { onExpand: () => void; icon: React.ReactNode }) {
  return (
    <div className="hidden shrink-0 bg-zinc-100 py-4 pl-4 lg:block">
      <button
        type="button"
        onClick={onExpand}
        aria-label="Open editor"
        title="Open editor"
        className="flex animate-[capsule-in_360ms_cubic-bezier(0.16,1,0.3,1)] flex-col items-center gap-3 rounded-full bg-accent/8 px-2.5 py-4 text-accent ring-1 ring-inset ring-accent/35 transition-[background-color,box-shadow,scale] duration-150 hover:bg-accent/16 hover:ring-accent/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.97] active:bg-accent/22"
      >
        {icon}
        <span className="rotate-180 text-[13px] font-medium tracking-tight [writing-mode:vertical-rl]">Editor</span>
      </button>
    </div>
  )
}
