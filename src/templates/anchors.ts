/**
 * Edit anchors: how the preview finds the part of the page being edited.
 *
 * The editor and the template mark matching regions with `data-edit` segments,
 * nested the same way: section → item → field → line. The path of the focused
 * field is its segments read from the outside in, e.g. `['s:abc', 'i:def', 'highlights', '2']`.
 * The preview resolves it to the deepest matching element, so a field the page
 * doesn't render (an empty subtitle) falls back to its item, then its section.
 *
 * The export strips every anchor: they are editor plumbing, not part of the site.
 */

export const ANCHOR_ATTR = 'data-edit' as const

/**
 * Textareas whose text becomes several elements on the page set this to `lines`
 * (one per line) or `paragraphs` (split on blank lines); the caret then adds its
 * line or paragraph index as the last segment.
 */
export const SPLIT_ATTR = 'data-edit-split' as const

/** Spread onto such a textarea: `<textarea {...anchor('highlights')} {...splitBy('lines')}>`. */
export const splitBy = (by: 'lines' | 'paragraphs'): { [SPLIT_ATTR]: string } => ({ [SPLIT_ATTR]: by })

export type AnchorPath = string[]

/** Spread onto an element: `<h3 {...anchor('title')}>`. */
export const anchor = (segment: string | number): { [ANCHOR_ATTR]: string } => ({ [ANCHOR_ATTR]: String(segment) })
anchor.section = (id: string) => anchor(`s:${id}`)
anchor.item = (id: string) => anchor(`i:${id}`)

/** Splits text as the page does, keeping each part's index in the source. */
export const PARAGRAPH_BREAK = /\n\s*\n/

/** The anchor path of `target`, read up to (not including) `root`. Empty when nothing is anchored. */
export function anchorPathOf(target: Element, root: Element): AnchorPath {
  const path: AnchorPath = []
  for (let el: Element | null = target; el && el !== root; el = el.parentElement) {
    const segment = el.getAttribute(ANCHOR_ATTR)
    if (segment !== null) path.unshift(segment)
  }
  const part = splitIndex(target)
  if (part !== undefined && path.length > 0) path.push(String(part))
  return path
}

/** The deepest element under `root` matching a prefix of `path`, or null if not even the first segment matches. */
export function findAnchor(root: ParentNode, path: AnchorPath): Element | null {
  let found: Element | null = null
  let scope: ParentNode = root
  for (const segment of path) {
    const next = scope.querySelector(`[${ANCHOR_ATTR}="${CSS.escape(segment)}"]`)
    if (!next) break
    found = next
    scope = next
  }
  return found
}

/** `html` without anchor attributes. React escapes `"` in values, so a value never contains one. */
export const stripAnchors = (html: string) => html.replace(new RegExp(` ${ANCHOR_ATTR}="[^"]*"`, 'g'), '')

export const samePath = (a: AnchorPath | null, b: AnchorPath | null) =>
  a === b || (a !== null && b !== null && a.length === b.length && a.every((s, i) => s === b[i]))

function splitIndex(target: Element): number | undefined {
  if (!(target instanceof HTMLTextAreaElement)) return undefined
  const split = target.getAttribute(SPLIT_ATTR)
  if (split !== 'lines' && split !== 'paragraphs') return undefined
  const before = target.value.slice(0, target.selectionStart)
  return before.split(split === 'lines' ? '\n' : PARAGRAPH_BREAK).length - 1
}
