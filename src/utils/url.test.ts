import { describe, expect, it } from 'vitest'
import { parseInline } from './inline'
import { safeHref, safeImageSrc } from './url'

describe('safeHref', () => {
  it.each(['https://a.example', 'http://a.example', 'mailto:a@b.co', 'tel:+351912847193', '#top', 'assets/cv.pdf'])('allows %s', (url) => {
    expect(safeHref(url)).toBe(url)
  })
  it.each(['javascript:alert(1)', ' JavaScript:alert(1)', 'java\nscript:alert(1)', 'data:text/html,hi', 'vbscript:x', ''])('rejects %j', (url) => {
    expect(safeHref(url)).toBeUndefined()
  })
})

describe('safeImageSrc', () => {
  it('allows raster data URLs and http(s), rejects SVG data and scripts', () => {
    expect(safeImageSrc('data:image/png;base64,AAAA')).toBeDefined()
    expect(safeImageSrc('https://picsum.photos/seed/ana/80')).toBeDefined()
    expect(safeImageSrc('data:image/svg+xml;base64,AAAA')).toBeUndefined()
    expect(safeImageSrc('javascript:alert(1)')).toBeUndefined()
  })
})

describe('parseInline', () => {
  it('splits [label](url) links out of plain text', () => {
    expect(parseInline('Built the [pricing page](https://x.co), shipped.')).toEqual([
      { text: 'Built the ' },
      { text: 'pricing page', href: 'https://x.co' },
      { text: ', shipped.' },
    ])
  })
  it('leaves unmatched brackets as text', () => {
    expect(parseInline('a [b] (c)')).toEqual([{ text: 'a [b] (c)' }])
  })
})
