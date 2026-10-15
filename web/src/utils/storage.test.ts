import { describe, expect, it } from 'vitest'
import { sampleResume } from '@/resume/sample'
import { clearResume, loadResume, saveResume, STORAGE_KEY, type KeyValueStore } from './storage'

const memoryStore = (initial: Record<string, string> = {}): KeyValueStore => {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  }
}

describe('storage', () => {
  it('round-trips a resume', () => {
    const store = memoryStore()
    expect(saveResume(store, sampleResume)).toEqual({ ok: true })
    expect(loadResume(store)).toEqual(sampleResume)
    clearResume(store)
    expect(loadResume(store)).toBeNull()
  })

  it('returns null for corrupt or invalid data', () => {
    expect(loadResume(memoryStore({ [STORAGE_KEY]: '{oops' }))).toBeNull()
    expect(loadResume(memoryStore({ [STORAGE_KEY]: '{"profile":3}' }))).toBeNull()
  })

  it('reports a failed save instead of throwing', () => {
    const full: KeyValueStore = { ...memoryStore(), setItem: () => { throw new Error('QuotaExceededError') } }
    expect(saveResume(full, sampleResume).ok).toBe(false)
  })
})
