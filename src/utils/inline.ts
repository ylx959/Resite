/** A run of plain text, or an inline link written as `[label](url)`. */
export type InlineSegment = { text: string } | { text: string; href: string }

const LINK = /\[([^\]\n]+)\]\(([^)\s]+)\)/g

/** Splits text into plain runs and `[label](url)` links. Never produces HTML; renderers escape `text`. */
export function parseInline(text: string): InlineSegment[] {
  const segments: InlineSegment[] = []
  let last = 0
  for (const match of text.matchAll(LINK)) {
    if (match.index > last) segments.push({ text: text.slice(last, match.index) })
    segments.push({ text: match[1]!, href: match[2]! })
    last = match.index + match[0].length
  }
  if (last < text.length) segments.push({ text: text.slice(last) })
  return segments
}

/** Paragraphs separated by blank lines, trimmed, empties dropped. */
export const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
