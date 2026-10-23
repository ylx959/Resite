'use client'

import { useRef, useState } from 'react'
import type { SaveStatus } from '@/utils/resumeSync'
import type { AccountInfo } from '@/types/account'
import { Button, type ButtonProps } from '../ui/Button'
import { ConfirmIconButton } from '../ui/ConfirmButton'
import { HoverHint } from '../ui/HoverHint'
import { Download, Globe, Mark, Reset, Upload, User } from '../ui/icons'

const VERCEL_DROP_URL = 'https://vercel.com/drop'

export type ToolbarActions = {
  importJson: (file: File) => void
  exportJson: () => void
  /** Resolves true once the ZIP is downloading. */
  exportWebsite: () => Promise<boolean>
  reset: () => void
  openGuide: () => void
  openSignIn: () => void
  signOut: () => void
}

/** App header: brand, save state, account, and the file actions. */
export function Toolbar({ save, account, actions }: { save: SaveStatus; account: AccountInfo | null; actions: ToolbarActions }) {
  const [exporting, setExporting] = useState(false)

  /** Downloads the ZIP and opens Vercel Drop beside it, ready for the upload. */
  const download = async () => {
    // Open the tab now, inside the click, or popup blockers stop it; point it at Vercel only once the ZIP exists.
    const vercelTab = window.open('', '_blank')
    setExporting(true)
    try {
      const ok = await actions.exportWebsite()
      if (vercelTab && ok) {
        vercelTab.opener = null
        vercelTab.location.href = VERCEL_DROP_URL
      } else vercelTab?.close()
    } finally {
      setExporting(false)
    }
  }

  return (
    <header className="grid h-14 shrink-0 grid-cols-[1fr_auto] items-center gap-3 border-b border-zinc-900/8 bg-paper/90 px-4 backdrop-blur-sm sm:px-5 md:grid-cols-[1fr_auto_1fr]">
      {/* Left: file actions (wider screens; small screens get them under the editor). */}
      <div className="hidden items-center gap-1 justify-self-start md:flex">
        <HoverHint title="Import a resume file" hint="Open a .json file you saved from Resite. It replaces everything in the editor.">
          <ImportButton variant="ghost" size="sm" onFile={actions.importJson}>
            Import
          </ImportButton>
        </HoverHint>
        <HoverHint title="Save a backup" hint="Downloads your resume as a .json file. Import it later, or on another computer, to keep editing.">
          <Button variant="ghost" size="sm" onClick={actions.exportJson}>
            Save JSON
          </Button>
        </HoverHint>
        <ConfirmIconButton label="Reset to the sample resume" confirmLabel="Reset all?" onConfirm={actions.reset}>
          <Reset />
        </ConfirmIconButton>
      </div>

      {/* Center: brand and save state. */}
      <div className="flex min-w-0 items-center gap-2.5 md:justify-self-center">
        <Mark className="h-[13.2px] w-auto shrink-0" />
        <h1 className="truncate text-[14px] font-semibold tracking-tight text-zinc-900">Resite</h1>
        <SaveIndicator save={save} toAccount={account !== null} />
      </div>

      {/* Right: publishing. */}
      <div className="flex items-center gap-1 justify-self-end">
        <AccountButton account={account} actions={actions} />
        <Button variant="ghost" size="sm" icon={<Globe />} onClick={actions.openGuide}>
          <span className="hidden sm:inline">How to publish</span>
          <span className="sm:hidden">Publish</span>
        </Button>
        <HoverHint title="Get your website" hint="Packs your resume into a ready-to-host site (.zip) and opens Vercel Drop, so you can drag it in to go live.">
          <Button variant="primary" icon={<Download />} onClick={download} disabled={exporting} aria-busy={exporting}>
            {exporting ? 'Packaging…' : <><span className="hidden sm:inline">Download website</span><span className="sm:hidden">ZIP</span></>}
          </Button>
        </HoverHint>
      </div>
    </header>
  )
}

/** Secondary file actions for small screens, where the toolbar has no room for them. */
export function MobileFileActions({ actions }: { actions: ToolbarActions }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-zinc-900/8 px-5 py-5 md:hidden">
      <ImportButton size="sm" onFile={actions.importJson}>
        Import JSON
      </ImportButton>
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

/** A button that opens the file picker for a resume JSON file, through a hidden `<input type="file">`. */
function ImportButton({ onFile, children, ...button }: Omit<ButtonProps, 'onClick' | 'icon'> & { onFile: (file: File) => void }) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          // Cleared so picking the same file again still fires `change`.
          e.target.value = ''
        }}
      />
      <Button {...button} icon={<Upload />} onClick={() => input.current?.click()}>
        {children}
      </Button>
    </>
  )
}

/** "Sign in" for guests; the username and a confirm-to-sign-out for signed-in users. */
function AccountButton({ account, actions }: { account: AccountInfo | null; actions: ToolbarActions }) {
  if (!account) {
    return (
      <HoverHint title="Keep your work" hint="Sign in to save your current edits to your account. They'll be here the next time you sign in.">
        <Button variant="ghost" size="sm" icon={<User />} onClick={actions.openSignIn}>
          Sign in
        </Button>
      </HoverHint>
    )
  }
  return (
    <span className="inline-flex items-center gap-1" title={account.email}>
      <span className="hidden max-w-32 items-center gap-1.5 truncate text-[13px] text-zinc-600 sm:inline-flex">
        <User className="shrink-0 text-zinc-400" />
        {account.username}
      </span>
      <Button variant="ghost" size="sm" onClick={actions.signOut}>
        Sign out
      </Button>
    </span>
  )
}

function SaveIndicator({ save, toAccount }: { save: SaveStatus; toAccount: boolean }) {
  const text = save.state === 'saved' ? 'Saved' : save.state === 'pending' ? 'Saving' : 'Not saved'
  return (
    <span role="status" title={save.state === 'error' ? save.message : toAccount ? 'Saved to your account' : 'Saved in this browser'} className="hidden items-center gap-1.5 text-xs text-zinc-400 sm:inline-flex">
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
