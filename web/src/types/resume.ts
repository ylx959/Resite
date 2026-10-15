/**
 * The Resume data shape. Terms are defined in CONTEXT.md.
 *
 * Pure data: no UI concerns live here. The editor, the preview and the export
 * engine all read this one shape.
 */

// --------------------------------------------------------------------------
// Version
// Bumped when the saved JSON shape changes; parseResume rejects newer files.
// --------------------------------------------------------------------------

export const RESUME_VERSION = 1

// --------------------------------------------------------------------------
// Profile
// The page header: name, title, site icon and the links beside the name.
// --------------------------------------------------------------------------

export type Icon = 'arrow' | 'note' | 'image'

export type Link = {
  id: string
  label: string
  href: string
  /** Trailing icon. Defaults to `arrow`. */
  icon?: Icon
}

export type Profile = {
  name: string
  title: string
  /**
   * The site icon: shown beside the name and as the browser-tab favicon.
   * Image URL or `data:` URL. Empty → the default mark.
   */
  icon: string
  /** Off → no icon beside the name and no favicon. */
  showIcon: boolean
  /** Header links beside the name. */
  links: Link[]
}

// --------------------------------------------------------------------------
// Section items
// The entries inside a section. Every item has a stable `id`.
// --------------------------------------------------------------------------

/**
 * Text fields marked "inline" accept `[label](https://…)` for inline links.
 * Paragraphs are separated by a blank line.
 */
export type InlineText = string

export type TimelineItem = {
  id: string
  title: string
  /** Role, degree, or tagline shown under the title. */
  subtitle: string
  /** Makes the title a link. */
  href: string
  /** Free-form, e.g. `2024` or `Mar 2024`. */
  start: string
  /** Empty → single date, unless `current`. */
  end: string
  /** Ongoing: shows "Present" as the end. */
  current: boolean
  summary: InlineText
  highlights: InlineText[]
}

/** A labelled row of tags, e.g. `Languages: TypeScript, Python`. */
export type TagGroup = {
  id: string
  label: string
  items: string[]
}

export type Person = {
  id: string
  name: string
  href: string
  /** Image URL or `data:` URL. Empty → initials. */
  avatar: string
}

// --------------------------------------------------------------------------
// Sections
// One section kind per item type, joined into the `Section` union.
// --------------------------------------------------------------------------

type SectionBase = {
  id: string
  title: string
  visible: boolean
}

export type TextSection = SectionBase & { kind: 'text'; body: InlineText }
export type TimelineSection = SectionBase & { kind: 'timeline'; items: TimelineItem[] }
export type TagsSection = SectionBase & { kind: 'tags'; items: TagGroup[] }
export type PeopleSection = SectionBase & { kind: 'people'; intro: InlineText; items: Person[] }
export type LinksSection = SectionBase & { kind: 'links'; items: Link[] }

export type Section = TextSection | TimelineSection | TagsSection | PeopleSection | LinksSection
export type SectionKind = Section['kind']

/** Sections that hold a list of entries the user can add, edit, reorder and delete. */
export type ListSection = Exclude<Section, TextSection>
//only TextSection doesn't have 'items' that why 'exclucde'
export type ItemOf<S extends ListSection> = S['items'][number]
export type AnyItem = ItemOf<ListSection>

// --------------------------------------------------------------------------
// Settings
// Site-wide options for the exported website.
// --------------------------------------------------------------------------

export type TemplateId = 'minimal'

export type Settings = {
  template: TemplateId
  /** Hex color for text selection and small highlights, e.g. `#ff4a00`. */
  accent: string
  /** `<html lang>` of the exported site. */
  lang: string
}

// --------------------------------------------------------------------------
// Resume
// The whole document: what is saved, imported, exported and rendered.
// --------------------------------------------------------------------------

export type Resume = {
  version: typeof RESUME_VERSION
  profile: Profile
  /** Rendered in this order. Hidden sections stay in the data. */
  sections: Section[]
  settings: Settings
}
