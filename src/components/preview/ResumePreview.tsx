'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { getTemplate } from '@/templates'
import type { AnchorPath } from '@/templates/anchors'
import type { Resume } from '@/types/resume'
import { EditorLine } from './EditorLine'

/**
 * Live preview: the template component rendered through a portal into an iframe
 * that carries the template's own stylesheet and script — the same three pieces
 * the export writes to disk. The iframe isolates the template CSS from the app's,
 * and gives real viewport widths for the mobile view. It is never reloaded while
 * typing; only the portal re-renders. `editing` draws the `EditorLine` at that part of the page.
 */
export function ResumePreview({
  resume,
  width,
  editing,
}: {
  resume: Resume
  width: 'desktop' | 'mobile'
  editing: AnchorPath | null
}) {
  const template = getTemplate(resume.settings.template)
  const [mount, setMount] = useState<HTMLElement | null>(null)
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null)

  const srcDoc = useMemo(
    () =>
      `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">` +
      `<style>${template.css}</style><script>${template.script}</script></head><body><div id="root"></div></body></html>`,
    [template],
  )

  useEffect(() => {
    if (!frame) return
    const attach = () => {
      const doc = frame.contentDocument
      const root = doc?.getElementById('root')
      if (!doc || !root) return
      // Links inside the preview must not navigate the frame away from the editor.
      doc.addEventListener('click', (event) => {
        const anchor = event.target instanceof Element ? event.target.closest('a') : null
        if (!anchor) return
        if (anchor.target === '_blank') return
        event.preventDefault()
        const hash = anchor.getAttribute('href')
        if (hash?.startsWith('#')) doc.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
      })
      setMount(root)
    }
    if (frame.contentDocument?.readyState === 'complete' && frame.contentDocument.getElementById('root')) attach()
    frame.addEventListener('load', attach)
    return () => {
      frame.removeEventListener('load', attach)
      setMount(null)
    }
  }, [frame, srcDoc])

  const { Component } = template

  return (
    <div
      className={`relative mx-auto h-full overflow-hidden bg-[#fcfcfc] transition-[max-width,border-radius] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
        width === 'mobile'
          ? 'max-w-[390px] rounded-[2rem] shadow-[0_24px_48px_-20px_rgb(24_24_27/0.25),0_0_0_1px_rgb(24_24_27/0.08)]'
          : 'max-w-full rounded-xl shadow-[0_20px_40px_-24px_rgb(24_24_27/0.18),0_0_0_1px_rgb(24_24_27/0.07)]'
      }`}
    >
      <iframe ref={setFrame} title="Resume preview" srcDoc={srcDoc} className="block size-full border-0" />
      {mount && createPortal(<Component resume={resume} />, mount)}
      <EditorLine root={mount} path={editing} />
    </div>
  )
}
