'use client'

import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'

const control =
  'w-full rounded-lg bg-white px-3 text-[14px] text-zinc-900 ring-1 ring-zinc-900/10 transition-[box-shadow] duration-150 placeholder:text-zinc-400 hover:ring-zinc-900/20 focus:outline-none focus:ring-2 focus:ring-accent/70 aria-invalid:ring-red-500/70'

/** Label above, control, then helper or error text below. */
export function Field({
  label,
  helper,
  error,
  children,
  className = '',
}: {
  label: string
  helper?: ReactNode
  error?: string
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: true }) => ReactNode
  className?: string
}) {
  const id = useId()
  const noteId = `${id}-note`
  const note = error ?? helper
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-xs font-medium text-zinc-500">
        {label}
      </label>
      {children({ id, ...(note && { 'aria-describedby': noteId }), ...(error && { 'aria-invalid': true }) })}
      {note && (
        <p id={noteId} className={`text-xs ${error ? 'text-red-600' : 'text-zinc-400'}`}>
          {note}
        </p>
      )}
    </div>
  )
}

type TextProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  label: string
  value: string
  onChange: (value: string) => void
  helper?: ReactNode
  error?: string
}

export function TextField({ label, value, onChange, helper, error, className, ...props }: TextProps) {
  return (
    <Field label={label} helper={helper} error={error} className={className}>
      {(a11y) => (
        <input {...a11y} {...props} value={value} onChange={(e) => onChange(e.target.value)} className={`${control} h-9`} />
      )}
    </Field>
  )
}

type AreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> & {
  label: string
  value: string
  onChange: (value: string) => void
  helper?: ReactNode
}

/** Textarea that grows with its content (CSS `field-sizing`), from `rows` lines. */
export function TextAreaField({ label, value, onChange, helper, className, rows = 3, ...props }: AreaProps) {
  return (
    <Field label={label} helper={helper} className={className}>
      {(a11y) => (
        <textarea
          {...a11y}
          {...props}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${control} resize-y py-2 leading-relaxed [field-sizing:content]`}
          style={{ minHeight: `${rows * 1.625 + 1}rem` }}
        />
      )}
    </Field>
  )
}

/** Accessible on/off switch with a visible label. */
export function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2 text-[13px] text-zinc-600">
      <span className="relative inline-flex">
        <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-4.5 w-8 rounded-full bg-zinc-300 transition-colors duration-150 peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent" />
        <span className="pointer-events-none absolute top-0.5 left-0.5 size-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] peer-checked:translate-x-3.5" />
      </span>
      {label}
    </label>
  )
}
