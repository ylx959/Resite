'use client'

import type { Icon, Link } from '@/types/resume'
import { safeHref } from '@/utils/url'
import { Field, TextField } from '../ui/Field'

const ICON_LABELS: Record<Icon, string> = { arrow: 'Arrow', note: 'Pencil', image: 'Picture' }

/** Label, URL and trailing icon of one link. */
export function LinkFields({ link, update }: { link: Link; update: (patch: Partial<Omit<Link, 'id'>>) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
      <TextField label="Label" value={link.label} onChange={(label) => update({ label })} placeholder="GitHub" />
      <TextField
        label="URL"
        value={link.href}
        onChange={(href) => update({ href })}
        placeholder="https://… or mailto:…"
        inputMode="url"
        error={urlError(link.href)}
      />
      <Field label="Icon">
        {(a11y) => (
          <select
            {...a11y}
            value={link.icon ?? 'arrow'}
            onChange={(e) => update({ icon: e.target.value as Icon })}
            className="h-9 rounded-lg bg-white px-2 text-[14px] text-zinc-900 ring-1 ring-zinc-900/10 hover:ring-zinc-900/20 focus:ring-2 focus:ring-accent/70 focus:outline-none"
          >
            {Object.entries(ICON_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        )}
      </Field>
    </div>
  )
}

/** Inline error for URLs the template would refuse to link. */
export const urlError = (href: string) =>
  href.trim() && !safeHref(href) ? 'Use a web address (https://…), mailto: or tel: link.' : undefined
