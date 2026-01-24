import { X } from "lucide-react"
import { useEffect } from "react"
import { createPortal } from "react-dom"

import type { FullscreenOverlayProps } from "../types"

import { ExportControls } from "./ExportControls"
import styles from "./FullscreenOverlay.module.css"

/**
 * Fullscreen overlay for mermaid diagram viewer
 */
export function FullscreenOverlay({
  isOpen,
  onClose,
  children,
  onExportSvg,
  onExportPng,
}: FullscreenOverlayProps) {
  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return undefined

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (!isOpen) return undefined

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  if (!isOpen) return null

  const showExportControls = onExportSvg && onExportPng

  return createPortal(
    <div
      className={styles.overlay}
      role='dialog'
      aria-modal='true'
      aria-label='Mermaid diagram fullscreen view'
    >
      <div className={styles.header}>
        <h3 className={styles.title}>Mermaid Diagram</h3>
        <div className={styles.actions}>
          {showExportControls && (
            <ExportControls onExportSvg={onExportSvg} onExportPng={onExportPng} />
          )}
          <button
            type='button'
            onClick={onClose}
            className={styles.closeBtn}
            aria-label='Close fullscreen (Escape)'
            title='Close (ESC)'
          >
            <X size={20} aria-hidden='true' />
          </button>
        </div>
      </div>
      {children}
    </div>,
    document.body,
  )
}
