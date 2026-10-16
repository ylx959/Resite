'use client'

import { useState, type ReactNode } from 'react'
import { useDispatch } from '@/hooks/EditorContext'
import { anchor } from '@/templates/anchors'
import { createItem } from '@/resume/sectionKinds'
import type { Link, Resume } from '@/types/resume'
import { fileToIcon } from '@/utils/images'
import { Switch, TextField } from '../ui/Field'
import { Mark } from '../ui/icons'
import { AddSection } from './AddSection'
import { ImageField } from './ImageField'
import { ItemList } from './ItemList'
import { LinkFields } from './LinkFields'
import { SectionBlock } from './SectionBlock'

/** The whole editing column: profile, sections, and site settings. */
export function Editor({ resume }: { resume: Resume }) {
  const dispatch = useDispatch()
  const [added, setAdded] = useState<string | null>(null)
  const { profile, sections, settings } = resume

  return (
    <div className="flex flex-col gap-12 px-5 pt-8 pb-24 sm:px-8">
      <Group title="Profile" hint="Your name, icon and title head the page.">
        <div {...anchor('profile')}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField label="Name" value={profile.name} onChange={(name) => dispatch({ type: 'profile', patch: { name } })} autoComplete="name" {...anchor('name')} />
            <TextField label="Title" value={profile.title} onChange={(title) => dispatch({ type: 'profile', patch: { title } })} placeholder="Product Designer" {...anchor('title')} />
          </div>
          <div className="mt-3" {...anchor('icon')}>
            <Switch label="Show icon" checked={profile.showIcon} onChange={(showIcon) => dispatch({ type: 'profile', patch: { showIcon } })} />
            {profile.showIcon && (
              <div className="mt-3">
                <ImageField
                  label="Icon"
                  value={profile.icon}
                  onChange={(icon) => dispatch({ type: 'profile', patch: { icon } })}
                  process={fileToIcon}
                  placeholder={<Mark className="h-3 w-auto" />}
                  helper="Shown beside your name and as the browser-tab icon. Empty uses the default mark."
                />
              </div>
            )}
          </div>
          <div className="mt-5" {...anchor('links')}>
            <p className="mb-2 text-xs font-medium text-zinc-500">Header links</p>
            <ItemList<Link>
              items={profile.links}
              noun="link"
              onOp={(op) => dispatch({ type: 'profileLinks', op })}
              create={() => createItem('links') as Link}
              describe={(link) => link.label}
              empty="No header links. They sit beside your name."
              renderItem={(link, update) => <LinkFields link={link} update={update} />}
            />
          </div>
        </div>
      </Group>

      <Group title="Sections" hint="Open a section to edit it. Reorder, hide or delete with the controls on the right.">
        {sections.length === 0 ? (
          <p className="py-6 text-[13px] text-zinc-400">No sections. Add one below to start filling the page.</p>
        ) : (
          <div>
            {sections.map((section, i) => (
              <SectionBlock key={section.id} section={section} index={i} count={sections.length} defaultOpen={section.id === added} />
            ))}
          </div>
        )}
        <div className="mt-4">
          <AddSection
            onAdd={(section) => {
              setAdded(section.id)
              dispatch({ type: 'sections', op: { op: 'add', item: section } })
            }}
          />
        </div>
      </Group>

      <Group title="Site" hint="Applies to the exported website.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AccentField accent={settings.accent} onChange={(accent) => dispatch({ type: 'settings', patch: { accent } })} />
          <TextField
            label="Page language"
            value={settings.lang}
            onChange={(lang) => dispatch({ type: 'settings', patch: { lang } })}
            helper="A language code, like en, fr or zh-Hant."
            error={/^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i.test(settings.lang) ? undefined : 'Use a code like en or zh-Hant.'}
          />
        </div>
      </Group>
    </div>
  )
}

/** `#abc`, `ABC`, ` #aabbcc ` → `#aabbcc`; anything else → null. */
function toHex(input: string): string | null {
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim())?.[1]
  if (!hex) return null
  return `#${(hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex).toLowerCase()}`
}

/** Swatch picker plus a hex field you can type or paste into; commits only valid colors. */
function AccentField({ accent, onChange }: { accent: string; onChange: (accent: string) => void }) {
  const [draft, setDraft] = useState(accent)
  const [synced, setSynced] = useState(accent)
  if (accent !== synced) {
    setSynced(accent)
    setDraft(accent)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="accent" className="text-xs font-medium text-zinc-500">
        Accent color
      </label>
      <div className="flex h-9 items-center gap-2 rounded-lg bg-white px-1.5 ring-1 ring-zinc-900/10 focus-within:ring-2 focus-within:ring-accent/70">
        <input
          type="color"
          aria-label="Pick accent color"
          value={accent}
          onChange={(e) => onChange(e.target.value)}
          className="size-6 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0 [&::-moz-color-swatch]:rounded-md [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
        />
        <input
          id="accent"
          type="text"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            const hex = toHex(e.target.value)
            if (hex && hex !== accent) onChange(hex)
          }}
          onBlur={() => setDraft(accent)}
          spellCheck={false}
          autoComplete="off"
          maxLength={9}
          className="min-w-0 flex-1 bg-transparent font-mono text-[13px] text-zinc-600 outline-none"
        />
      </div>
      <p className="text-xs text-zinc-400">Used for text selection and focus rings.</p>
    </div>
  )
}

function Group({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`group-${title}`}>
      <header className="mb-5">
        <h2 id={`group-${title}`} className="text-[13px] font-semibold tracking-tight text-zinc-900">
          {title}
        </h2>
        <p className="mt-0.5 text-[13px] text-zinc-500">{hint}</p>
      </header>
      {children}
    </section>
  )
}
