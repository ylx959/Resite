'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, useRef, useState, type ReactNode } from 'react'

gsap.registerPlugin(useGSAP)

const ARMED_MS = 3000
const COLLAPSED = 28 // matches IconButton's size-7
const PAD_X = 8 // px-2 on the label
// --color-accent in globals.css; GSAP needs literal colors to interpolate.
const ACCENT = '#ff4a00'
const ACCENT_CLEAR = 'rgba(255,74,0,0)'

/**
 * A destructive icon button that asks twice. The first press arms it: the icon
 * morphs into an orange "Delete" pill (GSAP: width, fill, icon out, label in).
 * A second press within 3 seconds runs `onConfirm`; blur, Escape or the timeout
 * fold it back. One `<button>` throughout, so focus never jumps.
 */
export function ConfirmIconButton({
  label,
  confirmLabel = 'Confirm',
  onConfirm,
  children,
}: {
  label: string
  confirmLabel?: string
  onConfirm: () => void
  children: ReactNode
}) {
  const [armed, setArmed] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const icon = useRef<HTMLSpanElement>(null)
  const text = useRef<HTMLSpanElement>(null)
  const firstRun = useRef(true)

  useEffect(() => {
    if (!armed) return
    const timer = window.setTimeout(() => setArmed(false), ARMED_MS)
    return () => window.clearTimeout(timer)
  }, [armed])

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      // Mount: jump straight to the resting state, no animation.
      const instant = firstRun.current || reduce
      firstRun.current = false
      const d = (seconds: number) => (instant ? 0 : seconds)

      if (armed) {
        const width = (text.current?.offsetWidth ?? 40) + PAD_X * 2
        gsap
          .timeline({ defaults: { overwrite: 'auto' } })
          .to(icon.current, { opacity: 0, scale: 0.5, rotate: -12, duration: d(0.16), ease: 'power2.in' }, 0)
          // Start from transparent accent so the fill doesn't pass through muddy dark tones.
          .fromTo(
            button.current,
            { backgroundColor: ACCENT_CLEAR },
            { width, backgroundColor: ACCENT, color: '#fff', duration: d(0.42), ease: 'expo.out' },
            0.04,
          )
          .fromTo(text.current, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: d(0.28), ease: 'power3.out' }, 0.14)
      } else {
        gsap
          .timeline({ defaults: { overwrite: 'auto' } })
          .to(text.current, { opacity: 0, x: -4, duration: d(0.12), ease: 'power2.in' }, 0)
          .to(button.current, {
            width: COLLAPSED,
            backgroundColor: ACCENT_CLEAR,
            color: ACCENT,
            duration: d(0.34),
            ease: 'expo.out',
            // Hand fill and text color back to the CSS hover states.
            clearProps: 'backgroundColor,color',
          }, 0.04)
          .to(icon.current, { opacity: 1, scale: 1, rotate: 0, duration: d(0.24), ease: 'back.out(2)' }, 0.12)
      }
    },
    { dependencies: [armed], scope: button },
  )

  return (
    <button
      ref={button}
      type="button"
      aria-label={armed ? `${confirmLabel} (${label})` : label}
      title={armed ? undefined : label}
      onClick={() => (armed ? onConfirm() : setArmed(true))}
      onBlur={() => setArmed(false)}
      onKeyDown={(e) => e.key === 'Escape' && armed && (e.stopPropagation(), setArmed(false))}
      style={{ width: COLLAPSED }}
      className={`relative h-7 shrink-0 overflow-hidden rounded-md text-accent transition-[scale] duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent active:scale-[0.96] ${
        armed ? '' : 'hover:bg-accent/10'
      }`}
    >
      <span ref={icon} aria-hidden="true" className="absolute inset-y-0 left-0 grid w-7 place-items-center">
        {children}
      </span>
      <span
        ref={text}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-xs font-medium whitespace-nowrap opacity-0"
      >
        {confirmLabel}
      </span>
    </button>
  )
}
