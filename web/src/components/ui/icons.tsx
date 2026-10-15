import type { ReactNode, SVGProps } from 'react'
import { MARK_COLOR, MARK_PATH, MARK_VIEWBOX } from '@/templates/mark'

/** 16px line icons, stroke 1.5, drawn to match the resume template's link icons. */
function Svg({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

type P = SVGProps<SVGSVGElement>

export const ChevronDown = (p: P) => <Svg {...p}><path d="m4 6 4 4 4-4" /></Svg>
export const ArrowUp = (p: P) => <Svg {...p}><path d="M8 13V3m0 0L4 7m4-4 4 4" /></Svg>
export const ArrowDown = (p: P) => <Svg {...p}><path d="M8 3v10m0 0 4-4m-4 4-4-4" /></Svg>
export const Plus = (p: P) => <Svg {...p}><path d="M8 3.5v9M3.5 8h9" /></Svg>
export const Close = (p: P) => <Svg {...p}><path d="m4.5 4.5 7 7m0-7-7 7" /></Svg>
export const Trash = (p: P) => (
  <Svg {...p}>
    <path d="M3 4.5h10M6.5 4.5V3h3v1.5m-5 0 .5 8.5h5l.5-8.5" />
  </Svg>
)
export const Eye = (p: P) => (
  <Svg {...p}>
    <path d="M1.75 8S4 3.75 8 3.75 14.25 8 14.25 8 12 12.25 8 12.25 1.75 8 1.75 8Z" />
    <circle cx="8" cy="8" r="2" />
  </Svg>
)
export const EyeOff = (p: P) => (
  <Svg {...p}>
    <path d="M6.6 3.9A5.9 5.9 0 0 1 8 3.75C12 3.75 14.25 8 14.25 8a10 10 0 0 1-1.7 2.2M9.4 9.5a2 2 0 0 1-2.9-2.9M4.2 4.9A9.7 9.7 0 0 0 1.75 8S4 12.25 8 12.25c1 0 1.9-.26 2.7-.65M2 2l12 12" />
  </Svg>
)
export const Download = (p: P) => <Svg {...p}><path d="M8 2.5v8m0 0L5 7.5m3 3 3-3M3 13.5h10" /></Svg>
export const Upload = (p: P) => <Svg {...p}><path d="M8 10.5v-8m0 0L5 5.5m3-3 3 3M3 13.5h10" /></Svg>
export const Reset = (p: P) => (
  <Svg {...p}>
    <path d="M2.75 8a5.25 5.25 0 1 0 1.6-3.77M2.75 2.75v2.5h2.5" />
  </Svg>
)
export const Globe = (p: P) => (
  <Svg {...p}>
    <circle cx="8" cy="8" r="5.75" />
    <path d="M2.25 8h11.5M8 2.25c1.5 1.6 2.25 3.5 2.25 5.75S9.5 12.15 8 13.75C6.5 12.15 5.75 10.25 5.75 8S6.5 3.85 8 2.25Z" />
  </Svg>
)
export const Monitor = (p: P) => (
  <Svg {...p}>
    <rect x="1.75" y="2.75" width="12.5" height="8.5" rx="1.25" />
    <path d="M5.5 13.75h5M8 11.25v2.5" />
  </Svg>
)
export const Phone = (p: P) => (
  <Svg {...p}>
    <rect x="4.25" y="1.75" width="7.5" height="12.5" rx="1.5" />
    <path d="M7 11.75h2" />
  </Svg>
)
export const Pencil = (p: P) => (
  <Svg {...p}>
    <path d="m8.833 4.167 1.89-1.89c.521-.522 1.365-.522 1.886 0l1.114 1.114c.521.52.521 1.364 0 1.885l-1.89 1.89m-3-3-6.61 6.61c-.25.25-.39.59-.39.943v2.448h2.448c.353 0 .692-.14.943-.39l6.609-6.61m-3-3 3 3" />
  </Svg>
)
export const ImageIcon = (p: P) => (
  <Svg {...p}>
    <rect x="2.25" y="2.25" width="11.5" height="11.5" rx="2" />
    <path d="m2.5 11 3-3a1.3 1.3 0 0 1 1.9 0l4.6 4.7M9.5 6.25h.01" />
  </Svg>
)
export const ExternalArrow = (p: P) => <Svg {...p}><path d="M12 10V4m0 0H6m6 0l-7.833 7.833" /></Svg>

/** The app mark: an orange "Hired" badge. */
export const Mark = ({ className }: { className?: string }) => (
  <svg viewBox={MARK_VIEWBOX} aria-hidden="true" className={className}>
    <rect width="38" height="24" rx="6" fill={MARK_COLOR} />
    <path d={MARK_PATH} fill="white" />
  </svg>
)

/** Panel with a left rail: open/close the editor sidebar. */
export const Sidebar = (p: P) => (
  <Svg {...p}>
    <rect x="1.75" y="2.75" width="12.5" height="10.5" rx="1.75" />
    <path d="M6.25 2.75v10.5" />
  </Svg>
)
