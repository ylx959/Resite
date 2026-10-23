import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sampleResume } from '@/resume/sample'
import type { AccountInfo } from '@/types/account'
import type { Resume } from '@/types/resume'
import { createResumeSync, SAVE_DELAY_MS, type AccountAdapter, type SaveStatus } from './resumeSync'
import { loadResume, saveResume, type KeyValueStore } from './storage'

const memoryStore = (): KeyValueStore => {
  const data = new Map<string, string>()
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) }
}

const named = (name: string): Resume => ({ ...sampleResume, profile: { ...sampleResume.profile, name } })
const alice: AccountInfo = { email: 'alice@example.com', username: 'alice' }

/** An account adapter backed by one in-memory draft; `signedIn` says whether the server sees a session. */
function fakeAccount({ signedIn = false, draft = null as Resume | null } = {}) {
  const state = { signedIn, draft, saves: [] as Resume[], reachable: true }
  const adapter: AccountAdapter = {
    load: async () => (state.reachable ? { account: state.signedIn ? alice : null, resume: state.signedIn ? state.draft : null } : null),
    save: async (resume) => {
      if (!state.reachable) throw new Error('offline')
      state.saves.push(resume)
      state.draft = resume
      return { ok: true }
    },
    signOut: async () => {
      state.signedIn = false
    },
  }
  return { state, adapter }
}

function setup(options: Parameters<typeof fakeAccount>[0] = {}) {
  const local = memoryStore()
  const remote = fakeAccount(options)
  const statuses: SaveStatus[] = []
  const sync = createResumeSync({ local, account: remote.adapter, fallback: sampleResume, onStatus: (s) => statuses.push(s) })
  return { local, remote, statuses, sync }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('start', () => {
  it("prefers the account's copy, then this browser's, then the fallback", async () => {
    const signedIn = setup({ signedIn: true, draft: named('From account') })
    saveResume(signedIn.local, named('From browser'))
    expect(await signedIn.sync.start()).toEqual({ resume: named('From account'), account: alice })

    const guest = setup()
    saveResume(guest.local, named('From browser'))
    expect((await guest.sync.start()).resume).toEqual(named('From browser'))

    expect(await setup().sync.start()).toEqual({ resume: sampleResume, account: null })
  })

  it("falls back to this browser's copy when the server can't be reached", async () => {
    const { local, remote, sync } = setup({ signedIn: true, draft: named('From account') })
    remote.state.reachable = false
    saveResume(local, named('From browser'))
    expect(await sync.start()).toEqual({ resume: named('From browser'), account: null })
  })
})

describe('edit', () => {
  it('saves a guest only in this browser, after the short pause', async () => {
    const { local, remote, statuses, sync } = setup()
    await sync.start()
    sync.edit(named('Edited'))
    expect(statuses).toEqual([{ state: 'pending' }])
    await vi.advanceTimersByTimeAsync(SAVE_DELAY_MS.browser)
    expect(loadResume(local)).toEqual(named('Edited'))
    expect(remote.state.saves).toEqual([])
    expect(statuses.at(-1)).toEqual({ state: 'saved' })
  })

  it('saves a signed-in user to both places, once per pause in typing', async () => {
    const { local, remote, sync } = setup({ signedIn: true })
    await sync.start()
    sync.edit(named('A'))
    await vi.advanceTimersByTimeAsync(SAVE_DELAY_MS.account - 1)
    sync.edit(named('AB'))
    await vi.advanceTimersByTimeAsync(SAVE_DELAY_MS.account)
    expect(remote.state.saves).toEqual([named('AB')])
    expect(loadResume(local)).toEqual(named('AB'))
  })

  it('does not save back what it just loaded', async () => {
    const { remote, statuses, sync } = setup({ signedIn: true, draft: named('Loaded') })
    const { resume } = await sync.start()
    sync.edit(resume)
    await vi.runAllTimersAsync()
    expect(remote.state.saves).toEqual([])
    expect(statuses).toEqual([])
  })

  it('reports an unreachable server, keeping the browser copy', async () => {
    const { local, remote, statuses, sync } = setup({ signedIn: true })
    await sync.start()
    remote.state.reachable = false
    sync.edit(named('Offline edit'))
    await vi.runAllTimersAsync()
    expect(statuses.at(-1)).toMatchObject({ state: 'error' })
    expect(loadResume(local)).toEqual(named('Offline edit'))
  })
})

describe('signing in and out', () => {
  it("opens the account's saved resume on sign-in", async () => {
    const { remote, sync } = setup({ draft: named('Saved in account') })
    await sync.start()
    remote.state.signedIn = true
    expect(await sync.signedIn(alice)).toEqual(named('Saved in account'))
  })

  it('gives a new account the resume on screen', async () => {
    const { remote, sync } = setup()
    await sync.start()
    sync.edit(named('Made as a guest'))
    remote.state.signedIn = true
    expect(await sync.signedIn(alice)).toBeNull()
    expect(remote.state.draft).toEqual(named('Made as a guest'))
  })

  it('saves an edit made just before signing out to the account, then clears this browser', async () => {
    const { local, remote, sync } = setup({ signedIn: true })
    await sync.start()
    sync.edit(named('Last words'))
    expect(await sync.signOut()).toEqual(sampleResume)
    expect(remote.state.draft).toEqual(named('Last words'))
    expect(remote.state.signedIn).toBe(false)
    expect(loadResume(local)).toBeNull()
  })
})
