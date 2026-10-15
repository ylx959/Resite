import { describe, expect, it } from 'vitest'
import type { Resume } from '@/types/resume'
import { resumeReducer } from './reducer'
import { sampleResume } from './sample'
import { createItem, createSection } from './sectionKinds'

const run = (resume: Resume, ...actions: Parameters<typeof resumeReducer>[1][]) => actions.reduce(resumeReducer, resume)
const titles = (resume: Resume) => resume.sections.map((s) => s.title)

describe('resumeReducer', () => {
  it('adds, renames, hides, moves and removes sections', () => {
    const custom = createSection('links', 'Elsewhere')
    const next = run(
      sampleResume,
      { type: 'sections', op: { op: 'add', item: custom } },
      { type: 'section', id: custom.id, patch: { title: 'Find me' } },
      { type: 'sections', op: { op: 'move', id: custom.id, delta: -1 } },
      { type: 'section', id: 'about', patch: { visible: false } },
    )
    expect(titles(next).slice(-2)).toEqual(['Find me', 'Connect'])
    expect(next.sections.find((s) => s.id === 'about')!.visible).toBe(false)
    expect(titles(run(next, { type: 'sections', op: { op: 'remove', id: custom.id } }))).toEqual(titles(sampleResume))
  })

  it('ignores moves past either end', () => {
    expect(run(sampleResume, { type: 'sections', op: { op: 'move', id: 'about', delta: -1 } })).toEqual(sampleResume)
  })

  it('edits entries inside a section', () => {
    const entry = createItem('timeline')
    const next = run(
      sampleResume,
      { type: 'items', sectionId: 'projects', op: { op: 'add', item: entry } },
      { type: 'items', sectionId: 'projects', op: { op: 'update', id: entry.id, patch: { title: 'Lantern' } } },
      { type: 'items', sectionId: 'projects', op: { op: 'move', id: entry.id, delta: -1 } },
    )
    const projects = next.sections.find((s) => s.id === 'projects')!
    expect(projects.kind === 'timeline' && projects.items.map((i) => i.title)).toEqual(['Lantern', 'SparkCheck'])
  })

  it('applies body only to text sections and intro only to people sections', () => {
    const next = run(
      sampleResume,
      { type: 'section', id: 'skills', patch: { body: 'x', intro: 'y' } },
      { type: 'section', id: 'about', patch: { body: 'Hello' } },
    )
    expect(next.sections.find((s) => s.id === 'skills')).toEqual(sampleResume.sections.find((s) => s.id === 'skills'))
    expect(next.sections.find((s) => s.id === 'about')).toMatchObject({ body: 'Hello' })
  })

  it('does not mutate the previous state', () => {
    const before = structuredClone(sampleResume)
    run(sampleResume, { type: 'profile', patch: { name: 'Changed' } }, { type: 'sections', op: { op: 'remove', id: 'about' } })
    expect(sampleResume).toEqual(before)
  })
})
