const SAFE_LINK_SCHEMES = new Set(['http', 'https', 'mailto', 'tel'])
const SAFE_IMAGE_DATA = /^data:image\/(png|jpeg|gif|webp);base64,[a-z0-9+/=]+$/i

/** Browsers ignore whitespace and control characters inside a scheme (`java\tscript:`), so we do too. */
const schemeOf = (url: string) => /^([a-z][a-z0-9+.-]*):/i.exec(url.replace(/[\u0000- \u007f]/g, ''))?.[1]?.toLowerCase()

/**
 * `href` if it is safe to put in a link, otherwise `undefined`.
 * Allows http(s), mailto, tel, `#fragments` and relative paths; rejects `javascript:`, `data:` and the rest.
 */
export function safeHref(href: string): string | undefined {
  const url = href.trim()
  if (!url) return undefined
  const scheme = schemeOf(url)
  return scheme === undefined || SAFE_LINK_SCHEMES.has(scheme) ? url : undefined
}

/** `src` if it is safe for an `<img>`: http(s), relative paths, or a base64 PNG/JPEG/GIF/WebP data URL. */
export function safeImageSrc(src: string): string | undefined {
  const url = src.trim()
  if (!url) return undefined
  const scheme = schemeOf(url)
  if (scheme === 'data') return SAFE_IMAGE_DATA.test(url) ? url : undefined
  return scheme === undefined || scheme === 'http' || scheme === 'https' ? url : undefined
}

/** External links open in a new tab. */
export const isExternal = (href: string) => /^https?:/i.test(href)
