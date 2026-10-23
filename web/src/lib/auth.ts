import type { AccountInfo } from '@/types/account'
import type { Supabase } from './supabase'

/** Server only. Sign-up checks and the signed-in account; Supabase Auth does passwords, sessions and rate limits. */

export type SignupInput = { email: string; username: string; password: string }
export type SignupField = keyof SignupInput

// Each domain label excludes `.`, so there is only one way to match: linear time, no ReDoS.
const EMAIL = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/
const EMAIL_MAX = 254
// Same rule as the `profiles.username` check in web/supabase/migrations/.
const USERNAME = /^[a-zA-Z0-9_-]{3,30}$/
const PASSWORD_MIN = 8
// Supabase Auth hashes with bcrypt, which only reads the first 72 bytes; longer passwords would be silently cut.
const PASSWORD_MAX_BYTES = 72

/** The first problem with a sign-up form, or `null` when it is acceptable. */
export function checkSignup({ email, username, password }: SignupInput): { field: SignupField; error: string } | null {
  // Length first: a form field can be megabytes long, and nothing should scan that.
  if (email.length > EMAIL_MAX || !EMAIL.test(email)) return { field: 'email', error: 'Enter a valid email address.' }
  if (!USERNAME.test(username)) return { field: 'username', error: 'Use 3–30 letters, numbers, - or _.' }
  if (password.length < PASSWORD_MIN) return { field: 'password', error: `Use at least ${PASSWORD_MIN} characters.` }
  if (Buffer.byteLength(password) > PASSWORD_MAX_BYTES) return { field: 'password', error: 'Use a shorter password (at most 72 bytes).' }
  return null
}

/** Normalizes the email the same way for sign-up and sign-in. */
export const normalizeEmail = (email: string) => email.trim().toLowerCase().slice(0, EMAIL_MAX + 1)

/** The signed-in account for this request, or `null`. `getUser` checks the token with Supabase, not just the cookie. */
export async function currentAccount(supabase: Supabase): Promise<(AccountInfo & { id: string }) | null> {
  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user?.email) return null
  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).maybeSingle<{ username: string }>()
  return { id: user.id, email: user.email, username: profile?.username ?? user.email }
}
