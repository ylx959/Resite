import JSZip from 'jszip'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { deployNotes, deploySteps } from '@/content/deployGuide'
import { stripAnchors } from '@/templates/anchors'
import { MARK_SVG } from '@/templates/mark'
import { siteDescription, siteTitle } from '@/templates/content'
import { getTemplate } from '@/templates'
import type { Resume } from '@/types/resume'
import { DEFAULT_ICON, SiteDocument } from '@/templates/SiteDocument'
import { safeImageSrc } from '@/utils/url'

/** One file of the exported site. Paths are relative to the site root. */
export type SiteFile = { path: string; content: string | Uint8Array }

export const ZIP_ROOT = 'resume-website'

/**
 * The whole static site for `resume`, as files. Pure and synchronous.
 *
 * The page is the same template component the preview renders, turned into HTML by
 * `renderToStaticMarkup` — React escapes every piece of user text, so there is no
 * string templating of user content anywhere. Uploaded images (data URLs) become
 * real files under `assets/images/`. The editor's anchors are stripped.
 */
export function buildSite(resume: Resume): SiteFile[] {
  const template = getTemplate(resume.settings.template)
  const { resume: linked, images } = extractImages(resume)

  const html = stripAnchors(
    renderToStaticMarkup(
      createElement(SiteDocument, {
        resume: linked,
        template,
        title: siteTitle(resume),
        description: siteDescription(resume),
      }),
    ),
  )

  return [
    { path: 'index.html', content: `<!doctype html>\n${html}\n` },
    { path: 'assets/style.css', content: template.css.trimStart() },
    { path: 'assets/script.js', content: template.script },
    ...(linked.profile.showIcon && !safeImageSrc(linked.profile.icon) ? [{ path: DEFAULT_ICON, content: MARK_SVG }] : []),
    ...images,
    { path: 'README.md', content: readme(siteTitle(resume)) },
  ]
}

/** `files` packed into a ZIP under `resume-website/`. */
export function zipSite(files: SiteFile[]): Promise<Uint8Array> {
  const zip = new JSZip()
  const root = zip.folder(ZIP_ROOT)!
  for (const file of files) root.file(file.path, file.content)
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })
}

/** The downloadable ZIP for `resume`. */
export async function exportWebsite(resume: Resume): Promise<Blob> {
  const bytes = await zipSite(buildSite(resume))
  return new Blob([bytes as BlobPart], { type: 'application/zip' })
}

// --- Internals ---

const DATA_URL = /^data:image\/(png|jpeg|gif|webp);base64,([a-z0-9+/=]+)$/i
const EXTENSIONS: Record<string, string> = { png: 'png', jpeg: 'jpg', gif: 'gif', webp: 'webp' }

/** Moves data-URL images (icon, avatars) into `assets/images/` files and points the resume at them. Identical images share a file. */
function extractImages(resume: Resume): { resume: Resume; images: SiteFile[] } {
  const byDataUrl = new Map<string, string>()
  const images: SiteFile[] = []

  const toFile = (src: string): string => {
    const match = DATA_URL.exec(src.trim())
    if (!match) return src
    const existing = byDataUrl.get(src)
    if (existing) return existing
    const path = `assets/images/image-${images.length + 1}.${EXTENSIONS[match[1]!.toLowerCase()]}`
    images.push({ path, content: base64ToBytes(match[2]!) })
    byDataUrl.set(src, path)
    return path
  }

  const sections = resume.sections.map((section) =>
    section.kind === 'people'
      ? { ...section, items: section.items.map((p) => ({ ...p, avatar: toFile(p.avatar) })) }
      : section,
  )
  const profile = { ...resume.profile, icon: toFile(resume.profile.icon) }
  return { resume: { ...resume, profile, sections }, images }
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function readme(title: string): string {
  const steps = deploySteps
    .map((step, i) => `${i + 1}. **${step.title}.** ${step.body}${step.link ? ` (${step.link.href})` : ''}`)
    .join('\n')
  return `# ${title.replace(/[\r\n]+/g, ' ')}

A static resume website made with Resite. Plain HTML, CSS and JavaScript:
no install, no build step, no server.

## Files

- \`index.html\` — the page
- \`assets/style.css\` — the design
- \`assets/script.js\` — reserved for small interactions (empty by default)
- \`assets/images/\` — your images

Open \`index.html\` in a browser to preview it.

## Put it online with Vercel

${steps}

## Notes

${deployNotes.map((note) => `- ${note}`).join('\n')}
`
}
