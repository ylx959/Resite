'use client'

import { createContext, useContext } from 'react'
import type { ResumeAction } from '@/resume/reducer'

/** `dispatch` for editor components, so it isn't threaded through every level. */
export const DispatchContext = createContext<((action: ResumeAction) => void) | null>(null)

export function useDispatch() {
  const dispatch = useContext(DispatchContext)
  if (!dispatch) throw new Error('useDispatch must be used inside <DispatchContext>')
  return dispatch
}
