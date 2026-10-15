'use client'

import { useEffect, useState } from 'react'

const KEY = 'resume-creator:panel'
export const PANEL_DEFAULT = 480
export const PANEL_MIN = 360
const PREVIEW_MIN = 420

/** Widest the editor may get in a window of `viewport` px, leaving room for the preview. */
export const panelMax = (viewport: number) => Math.max(PANEL_MIN, Math.min(820, viewport - PREVIEW_MIN))

export const clampPanel = (width: number, viewport: number) => Math.round(Math.min(Math.max(width, PANEL_MIN), panelMax(viewport)))

type Panel = { width: number; collapsed: boolean }

/**
 * Width and collapsed state of the desktop editor panel, remembered per browser.
 * Purely a viewing preference: losing it (private mode, cleared storage) just restores the default.
 */
export function useEditorPanel() {
  const [panel, setPanel] = useState<Panel>({ width: PANEL_DEFAULT, collapsed: false })

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<Panel> | null
      if (saved && typeof saved.width === 'number')
        setPanel({ width: clampPanel(saved.width, window.innerWidth), collapsed: saved.collapsed === true })
    } catch {}
  }, [])

  const update = (next: Panel) => {
    setPanel(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {}
  }

  return {
    ...panel,
    setWidth: (width: number) => update({ width: clampPanel(width, window.innerWidth), collapsed: false }),
    setCollapsed: (collapsed: boolean) => update({ ...panel, collapsed }),
  }
}
