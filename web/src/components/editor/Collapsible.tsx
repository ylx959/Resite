import type { ReactNode } from 'react'

/** Height-animated disclosure body. Closed content is `inert`, so it's skipped by Tab and screen readers. */
export function Collapsible({ open, id, children }: { open: boolean; id: string; children: ReactNode }) {
  return (
    <div
      id={id}
      inert={!open}
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}
    >
      <div className="relative min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}
