import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2)] hover:bg-accent-hover disabled:bg-zinc-400',
  secondary: 'bg-white text-zinc-800 ring-1 ring-zinc-900/10 hover:bg-zinc-50 hover:ring-zinc-900/15',
  outline: 'bg-accent/10 text-accent ring-1 ring-inset ring-accent hover:bg-accent/20 hover:text-accent-hover hover:ring-accent-hover disabled:bg-zinc-100 disabled:text-zinc-400 disabled:ring-zinc-300',
  ghost: 'text-zinc-600 hover:bg-zinc-900/5 hover:text-zinc-900',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: 'sm' | 'md'
  icon?: ReactNode
}

export function Button({ variant = 'secondary', size = 'md', icon, className = '', children, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-[background-color,color,box-shadow,scale] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98] disabled:pointer-events-none ${
        size === 'sm' ? 'h-7 px-2.5 text-[13px]' : 'h-8 px-3 text-[13px]'
      } ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}

const tones = {
  default: 'text-zinc-500 hover:bg-zinc-900/6 hover:text-zinc-900',
  danger: 'text-zinc-500 hover:bg-zinc-900/6 hover:text-red-600',
  accent: 'text-accent hover:bg-accent/10',
}

/** Square icon-only button. `label` is required: it is the accessible name and the tooltip. */
export function IconButton({
  label,
  className = '',
  children,
  tone = 'default',
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> & { label: string; tone?: 'default' | 'danger' | 'accent' }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`grid size-7 shrink-0 place-items-center rounded-md transition-[background-color,color,scale] duration-150 focus-visible:outline-2 focus-visible:outline-accent active:scale-[0.94] disabled:pointer-events-none disabled:opacity-30 ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
