import { describe, expect, it } from 'vitest'
import { checkSignup, normalizeEmail } from './auth'

const ok = { email: 'alice@example.com', username: 'alice', password: 'correct horse' }

describe('checkSignup', () => {
  it('accepts a normal sign-up', () => {
    expect(checkSignup(ok)).toBeNull()
  })

  it('names the field that is wrong', () => {
    for (const email of ['a@b', 'a@.b', 'a@b.', 'a@b..c', 'a b@c.d', '@b.c']) {
      expect(checkSignup({ ...ok, email })).toMatchObject({ field: 'email' })
    }
    expect(checkSignup({ ...ok, username: 'a b' })).toMatchObject({ field: 'username' })
    expect(checkSignup({ ...ok, username: 'ab' })).toMatchObject({ field: 'username' })
    expect(checkSignup({ ...ok, password: 'short' })).toMatchObject({ field: 'password' })
    // bcrypt ignores everything past 72 bytes, so refuse instead of silently truncating.
    expect(checkSignup({ ...ok, password: 'é'.repeat(37) })).toMatchObject({ field: 'password' })
  })

  it('rejects huge, hostile input quickly', () => {
    const started = performance.now()
    expect(checkSignup({ ...ok, email: `a@${'.'.repeat(5_000_000)}@` })).toMatchObject({ field: 'email' })
    expect(checkSignup({ ...ok, username: 'a'.repeat(5_000_000) })).toMatchObject({ field: 'username' })
    expect(checkSignup({ ...ok, password: 'x'.repeat(5_000_000) })).toMatchObject({ field: 'password' })
    expect(performance.now() - started).toBeLessThan(1000)
  })

  it('normalizes emails', () => {
    expect(normalizeEmail('  Alice@Example.COM ')).toBe('alice@example.com')
  })
})
