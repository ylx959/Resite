'use client'

import { useEffect, useReducer, useRef, useState } from 'react'
import { resumeReducer, type ResumeAction } from '@/resume/reducer'
import { sampleResume } from '@/resume/sample'
import type { Resume } from '@/types/resume'
import { loadResume, saveResume } from '@/utils/storage'

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

/**
 * The resume being edited, restored from and auto-saved to localStorage.
 * `resume` is `null` until the browser copy has been read (the first client render),
 * so nothing flashes the sample data over a saved resume.
 */
export function useResumeStore() {
  const [{ resume }, dispatch] = useReducer(reducer, { resume: null })
  const [save, setSave] = useState<SaveStatus>({ state: 'saved' })
  const loaded = useRef(false)

  useEffect(() => {
    dispatch({ type: 'loaded', resume: loadResume(window.localStorage) ?? sampleResume })
  }, [])

  useEffect(() => {
    if (!resume) return
    // The first value is what we just loaded; nothing to save yet.
    if (!loaded.current) {
      loaded.current = true
      return
    }
    setSave({ state: 'pending' })
    const timer = window.setTimeout(() => {
      const result = saveResume(window.localStorage, resume)
      setSave(result.ok ? { state: 'saved' } : { state: 'error', message: result.error })
    }, SAVE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [resume])

  return { resume, dispatch: dispatch as (action: ResumeAction) => void, save }
}
