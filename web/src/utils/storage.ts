import type { Resume } from '@/types/resume'
import { parseResume } from './validation'

export const STORAGE_KEY = 'resume-creator:v1'

/** The slice of `window.localStorage` we use; tests pass an in-memory stand-in. */
export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

/** The saved resume, or `null` when there is none or it no longer validates. Never throws. */
export function loadResume(store: KeyValueStore): Resume | null {
  try {
    const raw = store.getItem(STORAGE_KEY)
    if (raw === null) return null
    const result = parseResume(JSON.parse(raw))
    return result.ok ? result.resume : null
  } catch {
    return null
  }
}

export type SaveResult = { ok: true } | { ok: false; error: string }

/** Saves `resume`. Fails softly (quota exceeded, storage disabled) so editing never breaks. */
export function saveResume(store: KeyValueStore, resume: Resume): SaveResult {
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(resume))
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save in this browser. Storage may be full; try smaller images.' }
  }
}

export function clearResume(store: KeyValueStore): void {
  try {
    store.removeItem(STORAGE_KEY)
  } catch {}
}
