'use client'

import gsap from 'gsap'
import { Fragment, useEffect, useId, useRef, useState, type FocusEvent, type PointerEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const WIDTH = 248
/** Closest the card may get to the window's left and right edges. */
const EDGE = 12
/** Gap between the cursor and the top of the card. */
const BELOW = 20
const CLOSED = 'inset(0% 0% 100% 0% round 10px)'
const OPEN = 'inset(0% 0% 0% 0% round 10px)'
/** Displacement per color channel: red bends most, blue least, which fringes edges like a prism. */
const CHANNELS = [
  { scale: 34, matrix: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0' },
  { scale: 30, matrix: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0' },
  { scale: 26, matrix: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0' },
] as const

/**
 * Only Chromium runs an SVG filter as a backdrop filter; Safari and Firefox would
 * drop the whole declaration, so they get plain frosted blur instead.
 */
const canRefract = () => /Chrome\//.test(navigator.userAgent) && CSS.supports('backdrop-filter', 'url(#a) blur(1px)')

/**
 * Explains a button on hover: a small glass card unfolds under the cursor and
 * trails it (GSAP quickTo, so it lags a touch) while the pointer stays on the
 * button. Keyboard focus shows it under the button instead. Mouse and pen only:
 * touch has no hover, and a tap would flash it. The card is portalled to
 * `<body>` because the toolbar's backdrop blur would trap `position: fixed`.
 *
 * The glass: in Chromium the backdrop runs through an SVG filter that warps it
 * with noise, once per color channel at slightly different strengths, so what
 * sits behind the card bends and fringes as it moves. Gradient layers on top
 * add the sheen and the lit rim; other browsers get frosted blur.
 */
export function HoverHint({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  const card = useRef<HTMLDivElement>(null)
  const move = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null)
  const shown = useRef(false)
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [refract, setRefract] = useState(false)
  // useId's characters aren't all valid in a url(#…) reference.
  const filter = `glass-${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  useEffect(() => {
    setHost(document.body)
    setRefract(canRefract())
  }, [])

  useEffect(() => {
    const el = card.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const follow = { duration: reduce ? 0 : 0.5, ease: 'expo.out' }
    move.current = { x: gsap.quickTo(el, 'x', follow), y: gsap.quickTo(el, 'y', follow) }
    return () => {
      move.current?.x.tween.kill()
      move.current?.y.tween.kill()
      move.current = null
      gsap.killTweensOf(el)
      gsap.killTweensOf(el.querySelectorAll('p'))
    }
  }, [host])

  /** Points the card at (`clientX`, `clientY`); `snap` jumps there instead of gliding from the last spot. */
  const place = (clientX: number, clientY: number, snap = false) => {
    if (!move.current) return
    const x = Math.min(Math.max(clientX - WIDTH / 2, EDGE), window.innerWidth - WIDTH - EDGE)
    const y = clientY + BELOW
    move.current.x(x, snap ? x : undefined)
    move.current.y(y, snap ? y : undefined)
  }

  const show = () => {
    const el = card.current
    if (!el || shown.current) return
    shown.current = true
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const d = (seconds: number) => (reduce ? 0 : seconds)
    gsap
      .timeline({ defaults: { overwrite: 'auto' } })
      .fromTo(el, { autoAlpha: 0, clipPath: CLOSED }, { autoAlpha: 1, clipPath: OPEN, duration: d(0.42), ease: 'expo.out' }, 0)
      .fromTo(el.querySelectorAll('p'), { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: d(0.3), ease: 'power3.out', stagger: d(0.05) }, 0.08)
  }

  const hide = () => {
    const el = card.current
    if (!el || !shown.current) return
    shown.current = false
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    gsap.to(el, { autoAlpha: 0, clipPath: CLOSED, duration: reduce ? 0 : 0.2, ease: 'power2.in', overwrite: 'auto' })
  }

  const hovers = (e: PointerEvent) => e.pointerType === 'mouse' || e.pointerType === 'pen'

  const focus = (e: FocusEvent<HTMLSpanElement>) => {
    if (!(e.target instanceof HTMLElement) || !e.target.matches(':focus-visible')) return
    const rect = e.target.getBoundingClientRect()
    place(rect.left + rect.width / 2, rect.bottom - BELOW + 8, true)
    show()
  }

  return (
    <span
      className="inline-flex"
      onPointerEnter={(e) => hovers(e) && (place(e.clientX, e.clientY, true), show())}
      onPointerMove={(e) => hovers(e) && place(e.clientX, e.clientY)}
      onPointerLeave={hide}
      // Clicking does the thing; the explanation has done its job.
      onPointerDown={hide}
      onFocus={focus}
      onBlur={hide}
    >
      {children}
      {host &&
        createPortal(
          <div
            ref={card}
            aria-hidden="true"
            style={{
              width: WIDTH,
              visibility: 'hidden',
              opacity: 0,
              ...(refract && { backdropFilter: `url(#${filter}) blur(1.5px) saturate(1.8) brightness(1.06)` }),
            }}
            className={`pointer-events-none fixed top-0 left-0 z-50 isolate overflow-hidden rounded-[10px] px-3 pt-2.5 pb-3 will-change-transform shadow-[inset_1px_1px_0_rgb(255_255_255/0.85),inset_-1px_-1px_0_rgb(255_255_255/0.35),inset_0_0_14px_rgb(255_255_255/0.35),0_1px_2px_rgb(24_24_27/0.06),0_14px_34px_-14px_rgb(24_24_27/0.3)] ring-1 ring-zinc-900/10 ${
              refract ? 'bg-zinc-300/25' : 'bg-zinc-200/55 backdrop-blur-lg backdrop-saturate-150'
            }`}
          >
            {/* Sheen: light hits the top-left and falls off across the face. */}
            <span className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgb(255_255_255/0.6)_0%,rgb(255_255_255/0.12)_38%,transparent_55%,rgb(255_255_255/0.18)_100%)]" />
            {/* A thin bright arc along the top edge, like light caught in the bevel. */}
            <span className="absolute inset-x-3 top-0 -z-10 h-px bg-[linear-gradient(90deg,transparent,rgb(255_255_255),transparent)]" />
            <p className="flex items-center gap-1.5 text-[12.5px] font-medium tracking-tight text-zinc-900 [text-shadow:0_1px_0_rgb(255_255_255/0.6)]">
              <span className="size-1.5 shrink-0 rounded-full bg-accent" />
              {title}
            </p>
            <p className="mt-1 text-[12px] leading-snug text-zinc-700 [text-shadow:0_1px_0_rgb(255_255_255/0.5)]">{hint}</p>
            {refract && (
              <svg aria-hidden="true" className="absolute size-0">
                <filter id={filter} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
                  <feTurbulence type="fractalNoise" baseFrequency="0.008 0.014" numOctaves="2" seed="7" result="noise" />
                  <feGaussianBlur in="noise" stdDeviation="2" result="map" />
                  {CHANNELS.map(({ scale, matrix }, i) => (
                    // Fragments, not <g>: a filter's primitives must be its direct children.
                    <Fragment key={i}>
                      <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" result={`bent${i}`} />
                      <feColorMatrix in={`bent${i}`} type="matrix" values={matrix} result={`channel${i}`} />
                    </Fragment>
                  ))}
                  <feBlend in="channel0" in2="channel1" mode="screen" result="rg" />
                  <feBlend in="rg" in2="channel2" mode="screen" />
                </filter>
              </svg>
            )}
          </div>,
          host,
        )}
    </span>
  )
}
