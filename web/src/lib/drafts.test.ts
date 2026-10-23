import { describe, expect, it } from 'vitest'
import { sampleResume } from '@/resume/sample'
import { MAX_DRAFT_BYTES, prepareDraft } from './drafts'

describe('prepareDraft', () => {
  it('accepts a valid resume', () => {
    expect(prepareDraft(sampleResume)).toEqual({ ok: true, resume: sampleResume })
  })

  it('refuses data that is not a resume', () => {
    expect(prepareDraft({ profile: 3 }).ok).toBe(false)
    expect(prepareDraft('<script>').ok).toBe(false)
  })

  it('refuses oversized resumes', () => {
    const many = Array.from({ length: Math.ceil(MAX_DRAFT_BYTES / 15_000) }, (_, i) => ({ id: `t${i}`, kind: 'text', title: 'x', visible: true, body: 'x'.repeat(15_000) }))
    expect(prepareDraft({ ...sampleResume, sections: many })).toEqual({ ok: false, error: expect.stringContaining('too large') })
  })
})
