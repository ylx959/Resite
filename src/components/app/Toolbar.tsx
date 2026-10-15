'use client'

import { useRef, useState } from 'react'
import type { SaveStatus } from '@/hooks/useResumeStore'
import { Button } from '../ui/Button'
import { ConfirmIconButton } from '../ui/ConfirmButton'
import { Download, Globe, Mark, Reset, Upload } from '../ui/icons'

export type ToolbarActions = {
  importJson: (file: File) => void
  exportJson: () => void
  exportWebsite: () => Promise<void>
  reset: () => void
  openGuide: () => void
}

/** App header: brand, save state, and the file actions. */
export function Toolbar({ save, actions }: { save: SaveStatus; actions: ToolbarActions }) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [exporting, setExporting] = useState(false)

  const download = async () => {
    setExporting(true)
    try {
      await actions.exportWebsite()
    } finally {
      setExporting(false)
    }
  }

  return (
    <header className="grid h-14 shrink-0 grid-cols-[1fr_auto] items-center gap-3 border-b border-zinc-900/8 bg-paper/90 px-4 backdrop-blur-sm sm:px-5 md:grid-cols-[1fr_auto_1fr]">
      {/* Left: file actions (wider screens; small screens get them under the editor). */}
      <div className="hidden items-center gap-1 justify-self-start md:flex">
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) actions.importJson(file)
            e.target.value = ''
          }}
        />
        <Button variant="ghost" size="sm" icon={<Upload />} onClick={() => fileInput.current?.click()}>
          Import
        </Button>
        <Button variant="ghost" size="sm" onClick={actions.exportJson}>
          Save JSON
        </Button>
        <ConfirmIconButton label="Reset to the sample resume" confirmLabel="Reset all?" onConfirm={actions.reset}>
          <Reset />
        </ConfirmIconButton>
      </div>

      {/* Center: brand and save state. */}
      <div className="flex min-w-0 items-center gap-2.5 md:justify-self-center">
        <Mark className="h-3 w-auto shrink-0" />
        <h1 className="truncate text-[14px] font-semibold tracking-tight text-zinc-900">Resite</h1>
        <SaveIndicator save={save} />
      </div>

      {/* Right: publishing. */}
      <div className="flex items-center gap-1 justify-self-end">
        <Button variant="ghost" size="sm" icon={<Globe />} onClick={actions.openGuide}>
          <span className="hidden sm:inline">How to publish</span>
          <span className="sm:hidden">Publish</span>
        </Button>
        <Button variant="primary" icon={<Download />} onClick={download} disabled={exporting} aria-busy={exporting}>
          {exporting ? 'Packaging…' : <><span className="hidden sm:inline">Download website</span><span className="sm:hidden">ZIP</span></>}
        </Button>
      </div>
    </header>
  )
}

/** Secondary file actions for small screens, where the toolbar has no room for them. */
export function MobileFileActions({ actions }: { actions: ToolbarActions }) {
  const fileInput = useRef<HTMLInputElement>(null)
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-zinc-900/8 px-5 py-5 md:hidden">
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) actions.importJson(file)
          e.target.value = ''
        }}
      />
      <Button size="sm" icon={<Upload />} onClick={() => fileInput.current?.click()}>
        Import JSON
      </Button>
      <Button size="sm" onClick={actions.exportJson}>
        Save JSON
      </Button>
      <span className="ml-auto inline-flex items-center gap-1 text-xs text-zinc-500">
        Reset
        <ConfirmIconButton label="Reset to the sample resume" confirmLabel="Reset all?" onConfirm={actions.reset}>
          <Reset />
        </ConfirmIconButton>
      </span>
    </div>
  )
}

function SaveIndicator({ save }: { save: SaveStatus }) {
  const text = save.state === 'saved' ? 'Saved' : save.state === 'pending' ? 'Saving' : 'Not saved'
  return (
    <span role="status" title={save.state === 'error' ? save.message : 'Saved in this browser'} className="hidden items-center gap-1.5 text-xs text-zinc-400 sm:inline-flex">
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${
          save.state === 'saved' ? 'bg-emerald-500' : save.state === 'pending' ? 'animate-pulse bg-zinc-400' : 'bg-red-500'
        }`}
      />
      {text}
    </span>
  )
}
