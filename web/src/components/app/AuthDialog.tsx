'use client'

import { useActionState, useEffect, useRef, useState, type InputHTMLAttributes } from 'react'
import { signInAction, signUpAction, type AuthFormState } from '@/app/actions/auth'
import type { AccountInfo } from '@/types/account'
import { Collapsible } from '../editor/Collapsible'
import { Button, IconButton } from '../ui/Button'
import { control, Field } from '../ui/Field'
import { Close } from '../ui/icons'
import { Segmented } from '../ui/Segmented'

type Mode = 'sign-in' | 'sign-up'

const idle: AuthFormState = { status: 'idle' }

/** Sign in or create an account, in a centered native `<dialog>` that eases in and out. */
export function AuthDialog({ open, onClose, onSignedIn }: { open: boolean; onClose: () => void; onSignedIn: (account: AccountInfo) => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [mode, setMode] = useState<Mode>('sign-in')
  /** Bumped on every open, so each visit starts with a clean form while the closing animation keeps the old one. */
  const [visit, setVisit] = useState(0)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      setVisit((v) => v + 1)
      dialog.showModal()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  const done = (account: AccountInfo) => {
    onSignedIn(account)
    onClose()
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-labelledby="auth-title"
      className="m-auto w-[min(24rem,calc(100vw-2rem))] translate-y-3 scale-95 rounded-2xl bg-paper p-0 text-zinc-900 opacity-0 shadow-[0_0_0_1px_rgb(24_24_27/0.08),0_24px_48px_-24px_rgb(24_24_27/0.35)] transition-[opacity,scale,translate,display,overlay] transition-discrete duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] open:translate-y-0 open:scale-100 open:opacity-100 starting:open:translate-y-3 starting:open:scale-95 starting:open:opacity-0 backdrop:bg-zinc-900/0 backdrop:backdrop-blur-none backdrop:transition-[background-color,backdrop-filter,display,overlay] backdrop:transition-discrete backdrop:duration-300 open:backdrop:bg-zinc-900/20 open:backdrop:backdrop-blur-[2px] starting:open:backdrop:bg-zinc-900/0 starting:open:backdrop:backdrop-blur-none"
    >
      <div className="flex flex-col gap-5 p-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 id="auth-title" className="text-lg font-semibold tracking-tight">
              {mode === 'sign-in' ? 'Sign in' : 'Create an account'}
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">Your progress is saved to your account and picks up where you left off.</p>
          </div>
          <IconButton label="Close" onClick={onClose}>
            <Close />
          </IconButton>
        </header>
        <Segmented
          label="Account"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'sign-in', label: 'Sign in' },
            { value: 'sign-up', label: 'Create account' },
          ]}
        />
        {/* Both forms stay mounted: one folds shut while the other opens, so the dialog's height eases between them.
            The negative margin and padding keep the inputs' focus rings clear of the folds' overflow clipping. */}
        <div className="-m-1">
          <Collapsible id="auth-sign-in" open={mode === 'sign-in'}>
            <div className="p-1">
              <SignInForm key={`in-${visit}`} onDone={done} />
            </div>
          </Collapsible>
          <Collapsible id="auth-sign-up" open={mode === 'sign-up'}>
            <div className="p-1">
              <SignUpForm key={`up-${visit}`} onDone={done} />
            </div>
          </Collapsible>
        </div>
      </div>
    </dialog>
  )
}

function useAuthForm(action: (prev: AuthFormState, form: FormData) => Promise<AuthFormState>, onDone: (account: AccountInfo) => void) {
  const [state, submit, pending] = useActionState(action, idle)
  useEffect(() => {
    if (state.status === 'ok') onDone(state.account)
    // Only a new result should finish the form, not a new callback identity.
  }, [state])
  return { state, submit, pending, values: state.status === 'error' ? state.values : {} }
}

function SignInForm({ onDone }: { onDone: (account: AccountInfo) => void }) {
  const { state, submit, pending, values } = useAuthForm(signInAction, onDone)
  return (
    <form action={submit} className="flex flex-col gap-3.5">
      <Input label="Email" name="email" type="email" autoComplete="email" defaultValue={values.email} required autoFocus />
      <Input label="Password" name="password" type="password" autoComplete="current-password" required />
      <FormError state={state} />
      <Button type="submit" variant="outline" disabled={pending} aria-busy={pending} className="mt-1">
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}

function SignUpForm({ onDone }: { onDone: (account: AccountInfo) => void }) {
  const { state, submit, pending, values } = useAuthForm(signUpAction, onDone)
  const fieldError = (field: string) => (state.status === 'error' && state.field === field ? state.error : undefined)
  if (state.status === 'check-email') {
    return (
      <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2.5 text-[13px] leading-relaxed text-emerald-900 ring-1 ring-emerald-200">
        Almost done. Open the link we sent to <span className="font-medium">{state.email}</span> to confirm your account, then you're signed in here.
      </p>
    )
  }
  return (
    <form action={submit} className="flex flex-col gap-3.5">
      <Input label="Email" name="email" type="email" autoComplete="email" defaultValue={values.email} error={fieldError('email')} required autoFocus />
      <Input
        label="Username"
        name="username"
        autoComplete="username"
        defaultValue={values.username}
        error={fieldError('username')}
        helper="3–30 letters, numbers, - or _."
        required
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        error={fieldError('password')}
        helper="At least 8 characters."
        minLength={8}
        required
      />
      <Button type="submit" variant="outline" disabled={pending} aria-busy={pending} className="mt-1">
        {pending ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  )
}

/** An uncontrolled input for a form action, with the editor's field styling. */
function Input({ label, helper, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; helper?: string; error?: string }) {
  return (
    <Field label={label} helper={helper} error={error}>
      {(a11y) => <input {...a11y} {...props} className={`${control} h-9`} />}
    </Field>
  )
}

function FormError({ state }: { state: AuthFormState }) {
  if (state.status !== 'error') return null
  return (
    <p role="alert" className="text-xs text-red-600">
      {state.error}
    </p>
  )
}
