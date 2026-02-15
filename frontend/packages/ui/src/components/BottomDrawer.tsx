import type { ReactNode, Ref } from "react"
import { useEffect, useRef } from "react"

import styles from "./BottomDrawer.module.css"

export interface BottomDrawerProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly "aria-label": string
  readonly children: ReactNode
  readonly className?: string
  readonly ref?: Ref<HTMLElement>
}

export function BottomDrawer({
  open,
  onClose,
  "aria-label": ariaLabel,
  children,
  className = "",
  ref,
}: BottomDrawerProps) {
  const triggerRef = useRef<Element | null>(null)

  // Focus restoration + Escape key handler
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement
    } else if (triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus()
      triggerRef.current = null
    }

    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className={styles.backdrop}
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose()
          }}
          tabIndex={-1}
          aria-hidden='true'
        />
      )}

      {/* Drawer */}
      <aside
        ref={ref}
        role='dialog'
        aria-label={ariaLabel}
        aria-modal={open ? "true" : undefined}
        className={`${styles.drawer} ${className}`}
        data-open={open ? "" : undefined}
      >
        {children}
      </aside>
    </>
  )
}

// --- Compound sub-components ---

export interface BottomDrawerHeaderProps {
  readonly children: ReactNode
  readonly className?: string
}

export function BottomDrawerHeader({ children, className = "" }: BottomDrawerHeaderProps) {
  return <header className={`${styles.header} ${className}`}>{children}</header>
}

export interface BottomDrawerBodyProps {
  readonly children: ReactNode
  readonly className?: string
}

export function BottomDrawerBody({ children, className = "" }: BottomDrawerBodyProps) {
  return <div className={`${styles.body} ${className}`}>{children}</div>
}
