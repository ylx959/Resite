import { describe, expect, it } from 'vitest'
import { sampleResume } from '@/resume/sample'
import { parseResume, parseResumeJson } from './validation'

describe('parseResume', () => {
  it('accepts an exported resume unchanged', () => {
    expect(parseResume(JSON.parse(JSON.stringify(sampleResume)))).toEqual({ ok: true, resume: sampleResume })
  })

  it('fills defaults for missing optional fields', () => {
    const result = parseResume({
      profile: { name: 'Ana' },
      sections: [{ id: 'x', kind: 'timeline', title: 'Work', items: [{ title: 'Kiln & Co' }] }],
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.resume.settings).toEqual({ template: 'minimal', accent: '#ff4a00', lang: 'en' })
    expect(result.resume.profile.showIcon).toBe(true)
    const section = result.resume.sections[0]!
    expect(section.visible).toBe(true)
    expect(section.kind === 'timeline' && section.items[0]).toMatchObject({ title: 'Kiln & Co', highlights: [], current: false })
  })

  it('regenerates missing and duplicate ids', () => {
    const result = parseResume({
      profile: { name: 'Ana' },
      sections: [
        { id: 'same', kind: 'text', body: '' },
        { id: 'same', kind: 'text', body: '' },
        { kind: 'text', body: '' },
      ],
    })
    if (!result.ok) throw new Error(result.error)
    expect(new Set(result.resume.sections.map((s) => s.id)).size).toBe(3)
    expect(result.resume.sections.every((s) => s.id.length > 0)).toBe(true)
  })

  it.each([
    [null, 'resume should be an object.'],
    [{}, 'resume.profile should be an object.'],
    [{ profile: { name: 4 } }, 'resume.profile.name should be text.'],
    [{ profile: {}, sections: [{ kind: 'video' }] }, 'resume.sections[0].kind should be one of text, timeline, tags, people, links.'],
    [{ profile: {}, sections: 'nope' }, 'resume.sections should be a list.'],
    [{ profile: {}, settings: { accent: 'red' } }, 'resume.settings.accent should be a hex color like #ff4a00.'],
    [{ version: 2, profile: {} }, 'resume.version should be 1 (this file is from a newer version of Resite).'],
  ])('rejects %j', (input, error) => {
    expect(parseResume(input)).toEqual({ ok: false, error })
  })
})

describe('parseResumeJson', () => {
  it('reports invalid JSON', () => {
    expect(parseResumeJson('{ nope')).toEqual({ ok: false, error: 'This file is not valid JSON.' })
  })
})

describe('examples/raymond-yang.resume.json', () => {
  it('imports cleanly', async () => {
    const { readFileSync } = await import('node:fs')
    const result = parseResumeJson(readFileSync('examples/raymond-yang.resume.json', 'utf8'))
    expect(result.ok).toBe(true)
  })
})
