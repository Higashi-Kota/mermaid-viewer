import { ListOrdered, Minus, Plus, RotateCcw } from "lucide-react"
import type { ZoomControlsProps } from "../types"
import styles from "./ZoomControls.module.css"

/**
 * Zoom control buttons for pan-zoom viewer
 */
export function ZoomControls({
  onZoomIn,
  onZoomOut,
  onZoomReset,
  currentZoom,
  onEnterStepZoom,
  className = "",
}: ZoomControlsProps) {
  const zoomPercentage = Math.round(currentZoom * 100)

  return (
    <div className={[styles.controls, className].filter(Boolean).join(" ")}>
      <button
        type='button'
        onClick={onZoomOut}
        className={styles.btn}
        aria-label='Zoom out'
        title='Zoom out'
      >
        <Minus size={16} aria-hidden='true' />
      </button>

      <span className={styles.info} aria-live='polite'>
        {zoomPercentage}%
      </span>

      <button
        type='button'
        onClick={onZoomIn}
        className={styles.btn}
        aria-label='Zoom in'
        title='Zoom in'
      >
        <Plus size={16} aria-hidden='true' />
      </button>

      <button
        type='button'
        onClick={onZoomReset}
        className={styles.btn}
        aria-label='Reset zoom'
        title='Reset zoom'
      >
        <RotateCcw size={16} aria-hidden='true' />
      </button>

      {onEnterStepZoom && (
        <>
          <div className={styles.divider} aria-hidden='true' />
          <button
            type='button'
            onClick={onEnterStepZoom}
            className={styles.btn}
            aria-label='Start step zoom'
            title='Start step zoom'
          >
            <ListOrdered size={16} aria-hidden='true' />
          </button>
        </>
      )}
    </div>
  )
}
