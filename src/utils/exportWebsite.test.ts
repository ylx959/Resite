import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { sampleResume } from '@/resume/sample'
import type { Resume, Section } from '@/types/resume'
import { buildSite, zipSite, ZIP_ROOT } from './exportWebsite'

const withSections = (...sections: Section[]): Resume => ({ ...sampleResume, sections })
const html = (resume: Resume) => buildSite(resume).find((f) => f.path === 'index.html')!.content as string

// 1x1 transparent PNG
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

describe('buildSite', () => {
  it('produces the documented file layout', () => {
    expect(buildSite(sampleResume).map((f) => f.path)).toEqual([
      'index.html',
      'assets/style.css',
      'assets/script.js',
      'assets/images/favicon.svg',
      'README.md',
    ])
  })

  it('renders a complete, self-contained page with relative asset paths', () => {
    const page = html(sampleResume)
    expect(page.startsWith('<!doctype html>\n<html lang="en">')).toBe(true)
    expect(page).toContain('<title>Ines Varga-Holm — Frontend Engineer</title>')
    expect(page).toContain('href="assets/style.css"')
    expect(page).toContain('src="assets/script.js"')
    expect(page).not.toMatch(/(src|href)="\/(?!\/)/) // no root-absolute paths
    expect(page).not.toContain('_next')
  })

  it('renders visible sections in order and omits hidden and empty ones', () => {
    const [about, experience] = sampleResume.sections
    const page = html(
      withSections(
        { ...experience!, title: 'Work' },
        { ...about!, title: 'Hidden', visible: false },
        { id: 'empty', kind: 'links', title: 'Empty', visible: true, items: [] },
      ),
    )
    expect(page).toContain('>Work</h2>')
    expect(page).not.toContain('Hidden')
    expect(page).not.toContain('>Empty</h2>')
  })

  it('escapes user text instead of injecting HTML', () => {
    const page = html({
      ...sampleResume,
      profile: { ...sampleResume.profile, name: '<script>alert(1)</script>', title: '"><img src=x onerror=alert(1)>' },
    })
    expect(page).not.toContain('<script>alert(1)')
    expect(page).not.toContain('<img src=x')
    expect(page).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
  })

  it('drops unsafe URLs but keeps the text', () => {
    const page = html(
      withSections(
        { id: 'l', kind: 'links', title: 'Links', visible: true, items: [{ id: 'a', label: 'Bad', href: 'java\tscript:alert(1)' }] },
        { id: 't', kind: 'text', title: 'About', visible: true, body: 'See [this](javascript:void0) and [that](https://ok.example)' },
      ),
    )
    expect(page.toLowerCase()).not.toContain('javascript:')
    expect(page).toContain('See this and ')
    expect(page).toContain('href="https://ok.example" target="_blank" rel="noopener noreferrer"')
  })

  it('moves uploaded avatars into assets/images and shares identical ones', () => {
    const files = buildSite(
      withSections({
        id: 'p',
        kind: 'people',
        title: 'People',
        visible: true,
        intro: '',
        items: [
          { id: '1', name: 'Ana Ruiz', href: '', avatar: PNG },
          { id: '2', name: 'Bo Lind', href: '', avatar: PNG },
        ],
      }),
    )
    const image = files.find((f) => f.path === 'assets/images/image-1.png')
    expect(image?.content).toBeInstanceOf(Uint8Array)
    expect(files.filter((f) => f.path.startsWith('assets/images/image-'))).toHaveLength(1)
    expect(html(withSections())).not.toContain('data:image')
    const page = files.find((f) => f.path === 'index.html')!.content as string
    expect(page.match(/src="assets\/images\/image-1\.png"/g)).toHaveLength(2)
  })

  it('uses an uploaded icon for both the favicon and the mark beside the name', () => {
    const files = buildSite({ ...sampleResume, profile: { ...sampleResume.profile, icon: PNG } })
    const paths = files.map((f) => f.path)
    expect(paths).toContain('assets/images/image-1.png')
    expect(paths).not.toContain('assets/images/favicon.svg')
    const page = files.find((f) => f.path === 'index.html')!.content as string
    expect(page).toContain('<link rel="icon" href="assets/images/image-1.png"/>')
    expect(page).toContain('<img class="cv-mark" src="assets/images/image-1.png" alt=""/>')
    expect(page).not.toContain('data:image')
  })

  it('drops an unsafe icon URL and falls back to the default mark', () => {
    const page = html({ ...sampleResume, profile: { ...sampleResume.profile, icon: 'javascript:alert(1)' } })
    expect(page).not.toContain('javascript:')
    expect(page).toContain('href="assets/images/favicon.svg"')
  })

  it("leaves out the editor's anchors but keeps look-alike user text", () => {
    const resume: Resume = { ...sampleResume, profile: { ...sampleResume.profile, title: ' data-edit="x"' } }
    const page = html(resume)
    expect(page).not.toMatch(/ data-edit="/)
    expect(page).toContain('data-edit=&quot;x&quot;')
  })

  it('writes deployment instructions into the README', () => {
    const readme = buildSite(sampleResume).find((f) => f.path === 'README.md')!.content as string
    expect(readme).toContain('# Ines Varga-Holm — Frontend Engineer')
    expect(readme).toContain('vercel.com/drop')
  })
})

describe('zipSite', () => {
  it('packs every file under resume-website/ and round-trips the contents', async () => {
    const files = buildSite(sampleResume)
    const zip = await JSZip.loadAsync(await zipSite(files))
    const paths = Object.values(zip.files).filter((f) => !f.dir).map((f) => f.name)
    expect(paths.sort()).toEqual(files.map((f) => `${ZIP_ROOT}/${f.path}`).sort())
    expect(await zip.file(`${ZIP_ROOT}/index.html`)!.async('string')).toBe(files[0]!.content)
  })
})
