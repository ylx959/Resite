'use client'

import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { signOutAction } from '@/app/actions/auth'
import { saveResumeAction } from '@/app/actions/resume'
import type { ResumeResponse } from '@/app/api/resume/route'
import { resumeReducer, type ResumeAction } from '@/resume/reducer'
import { sampleResume } from '@/resume/sample'
import type { AccountInfo } from '@/types/account'
import type { Resume } from '@/types/resume'
import { createResumeSync, type AccountAdapter, type ResumeSync, type SaveStatus } from '@/utils/resumeSync'
import { parseResume } from '@/utils/validation'

type State = { resume: Resume | null }
type Action = ResumeAction | { type: 'loaded'; resume: Resume }

const reducer = (state: State, action: Action): State =>
  action.type === 'loaded'
    ? { resume: action.resume }
    : state.resume
      ? { resume: resumeReducer(state.resume, action) }
      : state

/** The real account: `GET /api/resume` to load, Server Actions to save and sign out. */
const accountAdapter: AccountAdapter = {
  async load() {
    try {
      const res = await fetch('/api/resume', { cache: 'no-store' })
      if (!res.ok) return null
      const body = (await res.json()) as ResumeResponse
      const parsed = body.resume === null ? null : parseResume(body.resume)
      return { account: body.account, resume: parsed?.ok ? parsed.resume : null }
    } catch {
      return null
    }
  },
  save: (resume) => saveResumeAction(resume),
  signOut: () => signOutAction(),
}

/**
 * The resume being edited, wired to `createResumeSync` (which decides where it is saved and when).
 * `resume` is `null` until the first load finishes, so nothing flashes the sample data over saved work.
 */
export function useResumeStore() {
  const [{ resume }, dispatch] = useReducer(reducer, { resume: null })
  const [account, setAccount] = useState<AccountInfo | null>(null)
  /** The first load finished: `account` is known, not just not-yet-fetched. */
  const [ready, setReady] = useState(false)
  const [save, setSave] = useState<SaveStatus>({ state: 'saved' })
  const sync = useRef<ResumeSync | null>(null)

  useEffect(() => {
    // Created here, not during render: it reads localStorage, which only exists in the browser.
    const created = createResumeSync({ local: window.localStorage, account: accountAdapter, fallback: sampleResume, onStatus: setSave })
    sync.current = created
    let cancelled = false
    void created.start().then((first) => {
      if (cancelled) return
      setAccount(first.account)
      dispatch({ type: 'loaded', resume: first.resume })
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (resume) sync.current?.edit(resume)
  }, [resume])

  const signedIn = useCallback(async (next: AccountInfo) => {
    setAccount(next)
    const saved = await sync.current?.signedIn(next)
    if (saved) dispatch({ type: 'loaded', resume: saved })
  }, [])

  const signOut = useCallback(async () => {
    const shown = await sync.current?.signOut()
    setAccount(null)
    if (shown) dispatch({ type: 'loaded', resume: shown })
  }, [])

  return { resume, dispatch: dispatch as (action: ResumeAction) => void, save, account, ready, signedIn, signOut }
}
