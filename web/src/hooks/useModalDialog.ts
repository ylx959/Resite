'use client'

import { useEffect, useRef, useState, type MouseEvent } from 'react'

/**
 * A native modal `<dialog>` driven by `open`: focus trap, Esc and the top layer come from the browser.
 * Spread `props` on the `<dialog>`; Esc and a click on the backdrop call `onClose`.
 * `opens` counts how many times it has opened, e.g. to key content that should start fresh on each visit.
 */
export function useModalDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null)
  const [opens, setOpens] = useState(0)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      setOpens((n) => n + 1)
      dialog.showModal()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  return {
    opens,
    props: {
      ref,
      onClose,
      onClick: (e: MouseEvent<HTMLDialogElement>) => e.target === e.currentTarget && onClose(),
    },
  }
}
