import type { Link, Resume, Section } from '@/types/resume'
import { paragraphs } from '@/utils/inline'
import { safeHref } from '@/utils/url'

/** Whether a section has anything to show. Empty sections are omitted from the page, like myResume did. */
export function hasContent(section: Section): boolean {
  switch (section.kind) {
    case 'text':
      return paragraphs(section.body).length > 0
    case 'people':
      return section.intro.trim().length > 0 || section.items.length > 0
    case 'tags':
      return section.items.some((group) => group.items.length > 0)
    case 'links':
      return section.items.some(isShownLink)
    case 'timeline':
      return section.items.length > 0
  }
}

/** A link worth rendering: it has a label and a safe URL. */
export const isShownLink = (link: Link) => link.label.trim().length > 0 && safeHref(link.href) !== undefined

/** The sections a template renders, in order: visible and non-empty. Shared by every template. */
export const visibleSections = (resume: Resume) => resume.sections.filter((s) => s.visible && hasContent(s))

/** `<title>` of the site, e.g. "Ines Varga-Holm — Frontend Engineer". */
export function siteTitle({ profile }: Resume): string {
  const parts = [profile.name.trim(), profile.title.trim()].filter(Boolean)
  return parts.length > 0 ? parts.join(' — ') : 'Resume'
}

/** Meta description: the first paragraph of the first visible text section, else the title. */
export function siteDescription(resume: Resume): string {
  const text = visibleSections(resume).find((s) => s.kind === 'text')
  const first = text?.kind === 'text' ? paragraphs(text.body)[0] : undefined
  const plain = first?.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  return (plain ?? siteTitle(resume)).slice(0, 160)
}
