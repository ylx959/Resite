import { createId } from '@/resume/id'
import {
  RESUME_VERSION,
  type Icon,
  type Link,
  type Person,
  type Resume,
  type Section,
  type Settings,
  type TagGroup,
  type TimelineItem,
} from '@/types/resume'

export type ParseResult = { ok: true; resume: Resume } | { ok: false; error: string }

/**
 * Checks untrusted input (an imported file, old localStorage) against the Resume shape.
 * Lenient where it is safe: missing optional fields get defaults, missing or duplicate ids
 * are regenerated. Strict where it matters: wrong types and unknown section kinds are errors.
 */
export function parseResume(input: unknown): ParseResult {
  try {
    return { ok: true, resume: resume(input, 'resume') }
  } catch (e) {
    if (e instanceof DecodeError) return { ok: false, error: e.message }
    throw e
  }
}

/** `parseResume` for raw JSON text. */
export function parseResumeJson(text: string): ParseResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: 'This file is not valid JSON.' }
  }
  return parseResume(data)
}

// --- Decoders. Each takes an unknown value and its path, and returns a typed value or throws. ---

class DecodeError extends Error {}

type Decoder<T> = (value: unknown, path: string) => T

const MAX_TEXT = 20_000
/** Avatars are stored as data URLs; keep a ceiling so one bad file can't fill localStorage. */
const MAX_IMAGE = 1_500_000

const fail = (path: string, expected: string): never => {
  throw new DecodeError(`${path} should be ${expected}.`)
}

const record = (value: unknown, path: string): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : fail(path, 'an object')

const text =
  (fallback = '', max = MAX_TEXT): Decoder<string> =>
  (value, path) => {
    if (value === undefined || value === null) return fallback
    if (typeof value !== 'string') return fail(path, 'text')
    return value.length > max ? fail(path, `at most ${max.toLocaleString('en')} characters`) : value
  }

const bool =
  (fallback: boolean): Decoder<boolean> =>
  (value, path) =>
    value === undefined ? fallback : typeof value === 'boolean' ? value : fail(path, 'true or false')

const list =
  <T>(item: Decoder<T>): Decoder<T[]> =>
  (value, path) => {
    if (value === undefined) return []
    if (!Array.isArray(value)) return fail(path, 'a list')
    return value.map((v, i) => item(v, `${path}[${i}]`))
  }

/** Fresh ids for missing or repeated ones, so React keys and list ops stay unambiguous. */
function withUniqueIds<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  return items.map((item) => {
    const id = item.id && !seen.has(item.id) ? item.id : createId()
    seen.add(id)
    return id === item.id ? item : { ...item, id }
  })
}

const ids =
  <T extends { id: string }>(item: Decoder<T>): Decoder<T[]> =>
  (value, path) =>
    withUniqueIds(list(item)(value, path))

const ICONS: readonly Icon[] = ['arrow', 'note', 'image']

const link: Decoder<Link> = (value, path) => {
  const o = record(value, path)
  const icon = o.icon === undefined ? undefined : ICONS.includes(o.icon as Icon) ? (o.icon as Icon) : fail(`${path}.icon`, ICONS.join(', ') + ' or omitted')
  return {
    id: text()(o.id, `${path}.id`),
    label: text()(o.label, `${path}.label`),
    href: text()(o.href, `${path}.href`),
    ...(icon && { icon }),
  }
}

const timelineItem: Decoder<TimelineItem> = (value, path) => {
  const o = record(value, path)
  return {
    id: text()(o.id, `${path}.id`),
    title: text()(o.title, `${path}.title`),
    subtitle: text()(o.subtitle, `${path}.subtitle`),
    href: text()(o.href, `${path}.href`),
    start: text()(o.start, `${path}.start`),
    end: text()(o.end, `${path}.end`),
    current: bool(false)(o.current, `${path}.current`),
    summary: text()(o.summary, `${path}.summary`),
    highlights: list(text())(o.highlights, `${path}.highlights`),
  }
}

const tagGroup: Decoder<TagGroup> = (value, path) => {
  const o = record(value, path)
  return {
    id: text()(o.id, `${path}.id`),
    label: text()(o.label, `${path}.label`),
    items: list(text('', 200))(o.items, `${path}.items`),
  }
}

const person: Decoder<Person> = (value, path) => {
  const o = record(value, path)
  return {
    id: text()(o.id, `${path}.id`),
    name: text()(o.name, `${path}.name`),
    href: text()(o.href, `${path}.href`),
    avatar: text('', MAX_IMAGE)(o.avatar, `${path}.avatar`),
  }
}

const section: Decoder<Section> = (value, path) => {
  const o = record(value, path)
  const base = {
    id: text()(o.id, `${path}.id`),
    title: text('', 200)(o.title, `${path}.title`),
    visible: bool(true)(o.visible, `${path}.visible`),
  }
  switch (o.kind) {
    case 'text':
      return { ...base, kind: 'text', body: text()(o.body, `${path}.body`) }
    case 'timeline':
      return { ...base, kind: 'timeline', items: ids(timelineItem)(o.items, `${path}.items`) }
    case 'tags':
      return { ...base, kind: 'tags', items: ids(tagGroup)(o.items, `${path}.items`) }
    case 'people':
      return { ...base, kind: 'people', intro: text()(o.intro, `${path}.intro`), items: ids(person)(o.items, `${path}.items`) }
    case 'links':
      return { ...base, kind: 'links', items: ids(link)(o.items, `${path}.items`) }
    default:
      return fail(`${path}.kind`, 'one of text, timeline, tags, people, links')
  }
}

const HEX = /^#[0-9a-f]{6}$/i

const settings: Decoder<Settings> = (value, path) => {
  const o = value === undefined ? {} : record(value, path)
  const accent = text('#ff4a00')(o.accent, `${path}.accent`)
  if (!HEX.test(accent)) fail(`${path}.accent`, 'a hex color like #ff4a00')
  if (o.template !== undefined && o.template !== 'minimal') fail(`${path}.template`, '"minimal"')
  const lang = text('en', 35)(o.lang, `${path}.lang`)
  return { template: 'minimal', accent, lang: /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i.test(lang) ? lang : 'en' }
}

const resume: Decoder<Resume> = (value, path) => {
  const o = record(value, path)
  if (o.version !== undefined && o.version !== RESUME_VERSION) {
    fail(`${path}.version`, `${RESUME_VERSION} (this file is from a newer version of Resite)`)
  }
  const profile = record(o.profile, `${path}.profile`)
  return {
    version: RESUME_VERSION,
    profile: {
      name: text('', 200)(profile.name, `${path}.profile.name`),
      title: text('', 200)(profile.title, `${path}.profile.title`),
      icon: text('', MAX_IMAGE)(profile.icon, `${path}.profile.icon`),
      links: ids(link)(profile.links, `${path}.profile.links`),
    },
    sections: ids(section)(o.sections, `${path}.sections`),
    settings: settings(o.settings, `${path}.settings`),
  }
}
