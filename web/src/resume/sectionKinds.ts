import type { ItemOf, ListSection, Section, SectionKind } from '@/types/resume'
import { createId } from './id'

type KindInfo = {
  label: string
  description: string
  /** What one entry is called in the editor, e.g. "entry", "group". */
  itemNoun: string
  /** …and more than one: "entries", "people". */
  itemNounPlural: string
}

/** Everything the app knows about each section kind, in "Add section" menu order. */
export const sectionKinds: Record<SectionKind, KindInfo> = {
  text: { label: 'Text', description: 'Paragraphs, like an introduction', itemNoun: 'paragraph', itemNounPlural: 'paragraphs' },
  timeline: { label: 'Timeline', description: 'Dated entries: jobs, schools, projects', itemNoun: 'entry', itemNounPlural: 'entries' },
  tags: { label: 'Tags', description: 'Labelled rows of chips, like skills', itemNoun: 'group', itemNounPlural: 'groups' },
  people: { label: 'People', description: 'Names with avatars, like collaborators', itemNoun: 'person', itemNounPlural: 'people' },
  links: { label: 'Links', description: 'A row of links, like contact details', itemNoun: 'link', itemNounPlural: 'links' },
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

export type ListKind = ListSection['kind']
/** The item type of a list section kind: `ItemOfKind<'tags'>` is `TagGroup`. */
export type ItemOfKind<K extends ListKind> = ItemOf<Extract<ListSection, { kind: K }>>

const blankItems: { [K in ListKind]: (id: string) => ItemOfKind<K> } = {
  timeline: (id) => ({ id, title: '', subtitle: '', href: '', start: '', end: '', current: false, summary: '', highlights: [] }),
  tags: (id) => ({ id, label: '', items: [] }),
  people: (id) => ({ id, name: '', href: '', avatar: '' }),
  links: (id) => ({ id, label: '', href: '' }),
}

/** A new, blank entry for a list section of `kind`, typed for that kind. */
export function createItem<K extends ListKind>(kind: K): ItemOfKind<K> {
  return blankItems[kind](createId())
}

export const isListSection = (section: Section): section is ListSection => section.kind !== 'text'
