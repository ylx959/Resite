'use client'

import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { signOutAction } from '@/app/actions/auth'
import { saveResumeAction } from '@/app/actions/resume'
import type { ResumeResponse } from '@/app/api/resume/route'
import { resumeReducer, type ResumeAction } from '@/resume/reducer'
import { sampleResume } from '@/resume/sample'
import type { AccountInfo } from '@/types/account'
import type { Resume } from '@/types/resume'
import { clearResume, loadResume, saveResume } from '@/utils/storage'
import { parseResume } from '@/utils/validation'

type State = { resume: Resume | null }
type Action = ResumeAction | { type: 'loaded'; resume: Resume }

const reducer = (state: State, action: Action): State =>
  action.type === 'loaded'
    ? { resume: action.resume }
    : state.resume
      ? { resume: resumeReducer(state.resume, action) }
      : state

export type SaveStatus = { state: 'saved' | 'pending' } | { state: 'error'; message: string }

const SAVE_DELAY_MS = 300
// Each account save is a round trip carrying the whole resume; batch fast typing into fewer of them.
const ACCOUNT_SAVE_DELAY_MS = 1000

/** Who is signed in and their saved progress; `null` when the server can't be reached. */
async function fetchAccount(): Promise<{ account: AccountInfo | null; resume: Resume | null } | null> {
  try {
    const res = await fetch('/api/resume', { cache: 'no-store' })
    if (!res.ok) return null
    const body = (await res.json()) as ResumeResponse
    const parsed = body.resume === null ? null : parseResume(body.resume)
    return { account: body.account, resume: parsed?.ok ? parsed.resume : null }
  } catch {
    return null
  }
}

const saveToAccount = (resume: Resume) =>
  saveResumeAction(resume).catch(() => ({ ok: false as const, error: 'Could not reach the server. Your edits are kept in this browser.' }))

/**
 * The resume being edited. Always kept in localStorage; when signed in, also saved to the account,
 * whose copy wins on load so progress follows the user between browsers.
 * `resume` is `null` until the first load finishes, so nothing flashes the sample data over saved work.
 */
export function useResumeStore() {
  const [{ resume }, dispatch] = useReducer(reducer, { resume: null })
  const [account, setAccount] = useState<AccountInfo | null>(null)
  /** The first load finished: `account` is known, not just not-yet-fetched. */
  const [ready, setReady] = useState(false)
  const [save, setSave] = useState<SaveStatus>({ state: 'saved' })
  /** The next resume change came from loading, not editing: don't save it back. */
  const skipSave = useRef(true)
  const accountRef = useRef(account)
  accountRef.current = account

  const load = useCallback((next: Resume) => {
    skipSave.current = true
    dispatch({ type: 'loaded', resume: next })
  }, [])

  useEffect(() => {
    void (async () => {
      const remote = await fetchAccount()
      setAccount(remote?.account ?? null)
      load(remote?.resume ?? loadResume(window.localStorage) ?? sampleResume)
      setReady(true)
    })()
  }, [load])

  useEffect(() => {
    if (!resume) return
    if (skipSave.current) {
      skipSave.current = false
      return
    }
    let stale = false
    setSave({ state: 'pending' })
    const timer = window.setTimeout(
      async () => {
        const local = saveResume(window.localStorage, resume)
        const result = accountRef.current ? await saveToAccount(resume) : local
        if (!stale) setSave(result.ok ? { state: 'saved' } : { state: 'error', message: result.error })
      },
      accountRef.current ? ACCOUNT_SAVE_DELAY_MS : SAVE_DELAY_MS,
    )
    return () => {
      stale = true
      window.clearTimeout(timer)
    }
  }, [resume])

  /** After sign-in: open the account's saved progress, or, for a new account, keep the current resume as its first save. */
  const signedIn = useCallback(
    async (next: AccountInfo) => {
      setAccount(next)
      const remote = await fetchAccount()
      if (remote?.resume) return load(remote.resume)
      if (resume) {
        const result = await saveToAccount(resume)
        setSave(result.ok ? { state: 'saved' } : { state: 'error', message: result.error })
      }
    },
    [load, resume],
  )

  /** Signs out and clears this browser's copy, so the next person here doesn't see it. It stays in the account. */
  const signOut = useCallback(async () => {
    await signOutAction()
    setAccount(null)
    clearResume(window.localStorage)
    load(sampleResume)
    setSave({ state: 'saved' })
  }, [load])

  return { resume, dispatch: dispatch as (action: ResumeAction) => void, save, account, ready, signedIn, signOut }
}
