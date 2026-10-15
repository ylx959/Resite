'use client'

import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { findAnchor, type AnchorPath } from '@/templates/anchors'

/** Space between the bottom of the row's text and the line under it. */
const GAP = 2
/** The part of the preview a target may sit in without scrolling, as fractions of its height. */
const BAND = [0.12, 0.8] as const
/** Where a target outside the band is scrolled to. */
const SCROLL_TO = 0.3

/**
 * The accent rule across the preview that marks what is being edited: the target's
 * first line of text sits on it, like writing on ruled paper, with an "Editing" tag
 * hanging under its right end. When `path` changes the page scrolls the target
 * into view; the line then follows it through scrolling, resizing and every
 * re-render of the page, and fades out when there is nothing to point at.
 *
 * `root` is the template's mount inside the preview iframe; the line is drawn in
 * the parent, over the iframe, which must fill the nearest positioned ancestor.
 */
export function EditorLine({ root, path }: { root: HTMLElement | null; path: AnchorPath | null }) {
  const line = useRef<HTMLDivElement>(null)
  const shown = useRef(false)

  useEffect(() => {
    const el = line.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const d = (seconds: number) => (reduce ? 0 : seconds)

    const hide = () => {
      if (!shown.current) return
      shown.current = false
      gsap.to(el, { autoAlpha: 0, duration: d(0.2), ease: 'power2.out', overwrite: 'auto' })
    }

    const win = root?.ownerDocument.defaultView
    if (!root || !win || !path) return hide()

    const moveTo = gsap.quickTo(el, 'y', { duration: d(0.5), ease: 'expo.out' })
    const target = () => findAnchor(root, path)

    const place = () => {
      const anchor = target()
      if (!anchor) return hide()
      const y = firstLineBottom(anchor) + GAP
      // Keep the tag clear of the frame's scrollbar.
      el.style.setProperty('--scrollbar', `${win.innerWidth - root.ownerDocument.documentElement.clientWidth}px`)
      if (shown.current) return void moveTo(y)
      // Appearing: start at the target instead of gliding in from the last spot.
      shown.current = true
      moveTo(y, y)
      gsap.to(el, { autoAlpha: 1, duration: d(0.25), ease: 'power2.out', overwrite: 'auto' })
    }

    const anchor = target()
    if (anchor) {
      const top = anchor.getBoundingClientRect().top
      const height = win.innerHeight
      if (top < height * BAND[0] || top > height * BAND[1]) {
        win.scrollTo({ top: win.scrollY + top - height * SCROLL_TO, behavior: reduce ? 'auto' : 'smooth' })
      }
    }
    place()

    let frame = 0
    const schedule = () => {
      win.cancelAnimationFrame(frame)
      frame = win.requestAnimationFrame(place)
    }
    win.addEventListener('scroll', schedule, { passive: true })
    win.addEventListener('resize', schedule)
    // Typing re-renders the page: rows grow, appear and disappear under the line.
    const observer = new MutationObserver(schedule)
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true })

    return () => {
      win.cancelAnimationFrame(frame)
      win.removeEventListener('scroll', schedule)
      win.removeEventListener('resize', schedule)
      observer.disconnect()
      moveTo.tween.kill()
    }
  }, [root, path])

  useEffect(() => () => void gsap.killTweensOf(line.current), [])

  return (
    <div
      ref={line}
      aria-hidden="true"
      style={{ visibility: 'hidden', opacity: 0 }}
      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-accent"
    >
      <span className="absolute top-full right-[calc(var(--scrollbar,0px)+1rem)] bg-accent px-1.5 pt-[3px] pb-[2px] font-mono text-[10px] leading-none tracking-[0.08em] text-white uppercase">
        Editing
      </span>
    </div>
  )
}

/** Bottom of the first line of text in `el`, in its frame's viewport; the element's own bottom if it has no text (an icon). */
function firstLineBottom(el: Element): number {
  const range = el.ownerDocument.createRange()
  range.selectNodeContents(el)
  const first = Array.from(range.getClientRects()).find((rect) => rect.height > 0)
  return (first ?? el.getBoundingClientRect()).bottom
}
