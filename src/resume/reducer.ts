import type { AnyItem, Link, Profile, Resume, Section, Settings } from '@/types/resume'
import { applyListOp, type ListOp } from './listOps'
import { isListSection } from './sectionKinds'

/** Fields a section-level `update` may change; `body` applies to text sections, `intro` to people sections. */
export type SectionPatch = Partial<{ title: string; visible: boolean; body: string; intro: string }>

export type ResumeAction =
  | { type: 'replace'; resume: Resume }
  | { type: 'profile'; patch: Partial<Omit<Profile, 'links'>> }
  | { type: 'profileLinks'; op: ListOp<Link> }
  | { type: 'sections'; op: ListOp<Section> }
  | { type: 'section'; id: string; patch: SectionPatch }
  | { type: 'items'; sectionId: string; op: ListOp<AnyItem> }
  | { type: 'settings'; patch: Partial<Settings> }

/**
 * Every edit the creator can make to a Resume. Pure: callers create ids
 * (see `createSection` / `createItem`) and pass whole new records in `add` ops.
 */
export function resumeReducer(resume: Resume, action: ResumeAction): Resume {
  switch (action.type) {
    case 'replace':
      return action.resume
    case 'profile':
      return { ...resume, profile: { ...resume.profile, ...action.patch } }
    case 'profileLinks':
      return { ...resume, profile: { ...resume.profile, links: applyListOp(resume.profile.links, action.op) } }
    case 'sections':
      return { ...resume, sections: applyListOp(resume.sections, action.op) }
    case 'section':
      return mapSection(resume, action.id, (s) => patchSection(s, action.patch))
    case 'items':
      return mapSection(resume, action.sectionId, (s) =>
        isListSection(s) ? ({ ...s, items: applyListOp<AnyItem>(s.items, action.op) } as Section) : s,
      )
    case 'settings':
      return { ...resume, settings: { ...resume.settings, ...action.patch } }
  }
}

function mapSection(resume: Resume, id: string, fn: (s: Section) => Section): Resume {
  return { ...resume, sections: resume.sections.map((s) => (s.id === id ? fn(s) : s)) }
}

function patchSection(section: Section, { title, visible, body, intro }: SectionPatch): Section {
  const next = {
    ...section,
    ...(title !== undefined && { title }),
    ...(visible !== undefined && { visible }),
  }
  if (next.kind === 'text' && body !== undefined) return { ...next, body }
  if (next.kind === 'people' && intro !== undefined) return { ...next, intro }
  return next
}
