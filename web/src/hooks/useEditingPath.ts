'use client'

import { useCallback, useState, type FocusEvent, type SyntheticEvent } from 'react'
import { anchorPathOf, samePath, type AnchorPath } from '@/templates/anchors'

/**
 * The anchor path of what the user is editing, for the preview's `EditorLine`.
 * Spread `trackProps` on the editor's root. Focus and caret moves update it (the
 * caret picks the line of a multi-line field); leaving the editor clears it.
 * Unchanged paths keep their identity, so moving within one field re-renders nothing.
 */
export function useEditingPath() {
  const [path, setPath] = useState<AnchorPath | null>(null)

  const track = useCallback((event: SyntheticEvent<HTMLElement>) => {
    if (!(event.target instanceof Element)) return
    const found = anchorPathOf(event.target, event.currentTarget)
    const next = found.length > 0 ? found : null
    setPath((prev) => (samePath(prev, next) ? prev : next))
  }, [])

  const onBlur = useCallback((event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setPath(null)
  }, [])

  return { path, trackProps: { onFocus: track, onSelect: track, onBlur } }
}
