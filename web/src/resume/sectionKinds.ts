import type { AnyItem, ListSection, Section, SectionKind } from '@/types/resume'
import { createId } from './id'

type KindInfo = {
  label: string
  description: string
  /** What one entry is called in the editor, e.g. "entry", "group". */
  itemNoun: string
}

/** Everything the app knows about each section kind, in "Add section" menu order. */
export const sectionKinds: Record<SectionKind, KindInfo> = {
  text: { label: 'Text', description: 'Paragraphs, like an introduction', itemNoun: 'paragraph' },
  timeline: { label: 'Timeline', description: 'Dated entries: jobs, schools, projects', itemNoun: 'entry' },
  tags: { label: 'Tags', description: 'Labelled rows of chips, like skills', itemNoun: 'group' },
  people: { label: 'People', description: 'Names with avatars, like collaborators', itemNoun: 'person' },
  links: { label: 'Links', description: 'A row of links, like contact details', itemNoun: 'link' },
}

export const sectionKindOrder = Object.keys(sectionKinds) as SectionKind[]

/** A new, empty section of `kind`. */
export function createSection(kind: SectionKind, title: string = sectionKinds[kind].label): Section {
  const base = { id: createId(), title, visible: true }
  switch (kind) {
    case 'text':
      return { ...base, kind, body: '' }
    case 'people':
      return { ...base, kind, intro: '', items: [] }
    default:
      return { ...base, kind, items: [] }
  }
}

/** A new, blank entry for a list section of `kind`. */
export function createItem(kind: ListSection['kind']): AnyItem {
  const id = createId()
  switch (kind) {
    case 'timeline':
      return { id, title: '', subtitle: '', href: '', start: '', end: '', current: false, summary: '', highlights: [] }
    case 'tags':
      return { id, label: '', items: [] }
    case 'people':
      return { id, name: '', href: '', avatar: '' }
    case 'links':
      return { id, label: '', href: '' }
  }
}

export const isListSection = (section: Section): section is ListSection => section.kind !== 'text'
