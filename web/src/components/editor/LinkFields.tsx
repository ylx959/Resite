'use client'

import type { Icon, Link } from '@/types/resume'
import { safeHref } from '@/utils/url'
import { Field, TextField } from '../ui/Field'
import { Select } from '../ui/Select'

const ICON_OPTIONS: { value: Icon; label: string }[] = [
  { value: 'arrow', label: 'Arrow' },
  { value: 'note', label: 'Pencil' },
  { value: 'image', label: 'Picture' },
]

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
          <Select {...a11y} value={link.icon ?? 'arrow'} options={ICON_OPTIONS} onChange={(icon) => update({ icon })} />
        )}
      </Field>
    </div>
  )
}

/** Inline error for URLs the template would refuse to link. */
export const urlError = (href: string) =>
  href.trim() && !safeHref(href) ? 'Use a web address (https://…), mailto: or tel: link.' : undefined
