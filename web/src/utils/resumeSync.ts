import type { AccountInfo } from '@/types/account'
import type { Resume } from '@/types/resume'
import { clearResume, loadResume, saveResume, type KeyValueStore, type SaveResult } from './storage'

export type SaveStatus = { state: 'saved' | 'pending' } | { state: 'error'; message: string }

/** The server side of saving, so tests can pass a fake. */
export type AccountAdapter = {
  /** Who is signed in and their saved resume; `null` when the server can't be reached. */
  load: () => Promise<{ account: AccountInfo | null; resume: Resume | null } | null>
  save: (resume: Resume) => Promise<SaveResult>
  signOut: () => Promise<void>
}

export type ResumeSync = {
  /** The first load: the account's copy, else this browser's, else `fallback`. */
  start: () => Promise<{ resume: Resume; account: AccountInfo | null }>
  /** Call with every new resume; saves after a pause in editing. The resume `start`/`signedIn`/`signOut` returned is not saved back. */
  edit: (resume: Resume) => void
  /** Saves a pending edit now. */
  flush: () => Promise<void>
  /** After sign-in: the account's saved resume to show, or `null` when it had none and adopted the current one. */
  signedIn: (account: AccountInfo) => Promise<Resume | null>
  /** Saves pending edits to the account, signs out, and clears this browser's copy. Returns the resume to show. */
  signOut: () => Promise<Resume>
}

/** Pauses before saving: short for the browser, longer when each save is a round trip with the whole resume. */
export const SAVE_DELAY_MS = { browser: 300, account: 1000 }

const unreachable: SaveResult = { ok: false, error: 'Could not reach the server. Your edits are kept in this browser.' }

/**
 * Where the resume being edited is kept. Always in `local`; when signed in, also in the account, whose copy
 * wins on load so progress follows the user between browsers. Reports every change of save state to `onStatus`.
 */
export function createResumeSync({
  local,
  account: remote,
  fallback,
  onStatus,
}: {
  local: KeyValueStore
  account: AccountAdapter
  /** Shown when nothing is saved anywhere, and after sign-out. */
  fallback: Resume
  onStatus: (status: SaveStatus) => void
}): ResumeSync {
  let account: AccountInfo | null = null
  let current: Resume | null = null
  let pending: Resume | null = null
  let timer: ReturnType<typeof setTimeout> | undefined
  // Each save gets a number; only the newest may report its result, so a slow old save can't overwrite a newer status.
  let latest = 0

  /** Makes `resume` the one on screen without saving it. */
  const show = (resume: Resume) => {
    clearTimeout(timer)
    current = resume
    pending = null
    return resume
  }

  const write = async (resume: Resume) => {
    const run = ++latest
    const saved = saveResume(local, resume)
    const result = account ? await remote.save(resume).catch(() => unreachable) : saved
    if (run === latest) onStatus(result.ok ? { state: 'saved' } : { state: 'error', message: result.error })
  }

  const flush = async () => {
    clearTimeout(timer)
    const resume = pending
    pending = null
    if (resume) await write(resume)
  }

  return {
    async start() {
      const found = await remote.load()
      account = found?.account ?? null
      return { resume: show(found?.resume ?? loadResume(local) ?? fallback), account }
    },

    edit(resume) {
      if (resume === current) return
      current = resume
      pending = resume
      onStatus({ state: 'pending' })
      clearTimeout(timer)
      timer = setTimeout(() => void flush(), account ? SAVE_DELAY_MS.account : SAVE_DELAY_MS.browser)
    },

    flush,

    async signedIn(next) {
      await flush()
      account = next
      const found = await remote.load()
      if (found?.resume) return show(found.resume)
      if (current) await write(current)
      return null
    },

    async signOut() {
      await flush()
      await remote.signOut()
      account = null
      clearResume(local)
      onStatus({ state: 'saved' })
      return show(fallback)
    },
  }
}
