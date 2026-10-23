'use server'

import type { AuthError } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { checkSignup, currentAccount, normalizeEmail, type SignupField } from '@/lib/auth'
import { createSupabase } from '@/lib/supabase'
import type { AccountInfo } from '@/types/account'

/** What the sign-in and sign-up forms show after a submit (`useActionState`). */
export type AuthFormState =
  | { status: 'idle' }
  | { status: 'error'; error: string; field?: SignupField; values: { email?: string; username?: string } }
  | { status: 'check-email'; email: string }
  | { status: 'ok'; account: AccountInfo }

const text = (form: FormData, name: string) => {
  const value = form.get(name)
  return typeof value === 'string' ? value : ''
}

/** Supabase Auth's error codes, as messages for the form. Unknown errors stay vague on purpose. */
function describe(error: AuthError): { error: string; field?: SignupField } {
  switch (error.code) {
    case 'invalid_credentials':
      return { error: 'Wrong email or password.' }
    case 'email_not_confirmed':
      return { error: 'Confirm your email first: open the link we sent you.' }
    case 'user_already_exists':
    case 'email_exists':
      return { field: 'email', error: 'An account with this email already exists.' }
    case 'email_address_invalid':
      return { field: 'email', error: 'Enter a valid email address.' }
    case 'weak_password':
      return { field: 'password', error: 'Choose a stronger password.' }
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return { error: 'Too many attempts. Wait a few minutes and try again.' }
    case 'signup_disabled':
      return { error: 'New accounts are turned off right now.' }
    default:
      // The profile trigger rejects a username taken a moment ago, which Supabase reports as a database error.
      return error.message.includes('Database error saving new user')
        ? { field: 'username', error: 'This username was just taken.' }
        : { error: 'Something went wrong. Try again.' }
  }
}

export async function signUpAction(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const input = { email: normalizeEmail(text(form, 'email')), username: text(form, 'username').trim(), password: text(form, 'password') }
  const values = { email: input.email, username: input.username.slice(0, 30) }
  const problem = checkSignup(input)
  if (problem) return { status: 'error', ...problem, values }

  const supabase = await createSupabase()
  const { data: available } = await supabase.rpc('username_available', { name: input.username })
  if (available === false) return { status: 'error', field: 'username', error: 'This username is taken.', values }

  // Supabase only follows this link if it is in Authentication → URL Configuration → Redirect URLs.
  const origin = (await headers()).get('origin')
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { username: input.username }, ...(origin && { emailRedirectTo: `${origin}/auth/callback` }) },
  })
  if (error) return { status: 'error', ...describe(error), values }
  // With "Confirm email" on, there is no session until the link is opened. (An already-registered email lands here too,
  // without an error, so the form can't be used to find out who has an account.)
  if (!data.session) return { status: 'check-email', email: input.email }
  return { status: 'ok', account: { email: input.email, username: input.username } }
}

export async function signInAction(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const email = normalizeEmail(text(form, 'email'))
  const password = text(form, 'password')
  const values = { email }
  if (!email || !password) return { status: 'error', error: 'Enter your email and password.', values }

  const supabase = await createSupabase()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { status: 'error', ...describe(error), values }
  const account = await currentAccount(supabase)
  if (!account) return { status: 'error', error: 'Something went wrong. Try again.', values }
  return { status: 'ok', account: { email: account.email, username: account.username } }
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabase()
  await supabase.auth.signOut()
}
