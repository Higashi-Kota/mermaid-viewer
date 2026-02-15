import { ChevronLeft, ChevronRight, X } from "lucide-react"
import styles from "./StepZoomControls.module.css"

export interface StepZoomControlsProps {
  readonly isActive: boolean
  readonly currentIndex: number
  readonly totalSteps: number
  readonly onNext: () => void
  readonly onPrevious: () => void
  readonly onExit: () => void
  readonly className?: string
}

/**
 * ステップズームのナビゲーションコントロール
 *
 * アクティブ時に表示され、前/次ボタンとカウンター表示を提供する。
 */
export function StepZoomControls({
  isActive,
  currentIndex,
  totalSteps,
  onNext,
  onPrevious,
  onExit,
  className = "",
}: StepZoomControlsProps) {
  if (!isActive || totalSteps === 0) return null

  const isFirst = currentIndex === 0
  const isLast = currentIndex === totalSteps - 1

  return (
    <div
      className={[styles.controls, className].filter(Boolean).join(" ")}
      role='toolbar'
      aria-label='Step zoom navigation'
    >
      <button
        type='button'
        onClick={onPrevious}
        className={styles.btn}
        disabled={isFirst}
        aria-label='Previous step'
        title='Previous step'
      >
        <ChevronLeft size={16} aria-hidden='true' />
      </button>

      <span className={styles.counter} aria-live='polite'>
        {currentIndex + 1} / {totalSteps}
      </span>

      <button
        type='button'
        onClick={onNext}
        className={styles.btn}
        disabled={isLast}
        aria-label='Next step'
        title='Next step'
      >
        <ChevronRight size={16} aria-hidden='true' />
      </button>

      <div className={styles.divider} aria-hidden='true' />

      <button
        type='button'
        onClick={onExit}
        className={styles.btn}
        aria-label='Exit step zoom'
        title='Exit step zoom'
      >
        <X size={16} aria-hidden='true' />
      </button>
    </div>
  )
}
