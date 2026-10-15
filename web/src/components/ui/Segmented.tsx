import type { ReactNode } from 'react'

/** A small pill-shaped radio group, e.g. Edit / Preview. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  className = '',
}: {
  label: string
  value: T
  options: { value: T; label: string; icon?: ReactNode }[]
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className={`inline-flex rounded-lg bg-zinc-900/6 p-0.5 ${className}`}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`inline-flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-2 focus-visible:outline-accent ${
              active ? 'bg-white text-zinc-900 shadow-[0_1px_2px_rgb(24_24_27/0.08),0_0_0_1px_rgb(24_24_27/0.06)]' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
