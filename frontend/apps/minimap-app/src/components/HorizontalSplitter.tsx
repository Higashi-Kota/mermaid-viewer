import type { ReactNode, Ref } from "react"
import { useRef, useState } from "react"
import styles from "./HorizontalSplitter.module.css"

export interface HorizontalSplitterProps {
  /** 左側コンテンツ */
  readonly left: ReactNode
  /** 右側コンテンツ */
  readonly right: ReactNode
  /** 初期分割位置（0-1、デフォルト: 0.4） */
  readonly initialRatio?: number
  /** 最小比率（デフォルト: 0.2） */
  readonly minRatio?: number
  /** 最大比率（デフォルト: 0.8） */
  readonly maxRatio?: number
  /** リサイザーのアクセシブルラベル */
  readonly "aria-label"?: string
  /** 追加のクラス名 */
  readonly className?: string
  /** React 19 ref support */
  readonly ref?: Ref<HTMLDivElement>
}

/**
 * 水平方向のリサイズ可能なスプリッター
 *
 * 左右のペインをドラッグまたはキーボードでリサイズ可能
 * WCAG 2.2 AA準拠: role="separator", キーボード操作対応
 */
export function HorizontalSplitter({
  left,
  right,
  initialRatio = 0.4,
  minRatio = 0.2,
  maxRatio = 0.8,
  "aria-label": ariaLabel = "Resize editor and preview panels",
  className = "",
  ref,
}: HorizontalSplitterProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ratio, setRatio] = useState(initialRatio)
  const [isDragging, setIsDragging] = useState(false)
  const startPosRef = useRef(0)
  const startRatioRef = useRef(ratio)

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(true)
    startPosRef.current = e.clientX
    startRatioRef.current = ratio

    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    e.preventDefault()

    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const delta = (e.clientX - startPosRef.current) / rect.width
    const newRatio = Math.max(minRatio, Math.min(maxRatio, startRatioRef.current + delta))
    setRatio(newRatio)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      e.preventDefault()
      setIsDragging(false)
      const target = e.currentTarget as HTMLElement
      target.releasePointerCapture(e.pointerId)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = 0.05
    let newRatio = ratio

    if (e.key === "ArrowLeft") {
      newRatio = Math.max(minRatio, ratio - step)
    } else if (e.key === "ArrowRight") {
      newRatio = Math.min(maxRatio, ratio + step)
    } else if (e.key === "Home") {
      newRatio = minRatio
    } else if (e.key === "End") {
      newRatio = maxRatio
    }

    if (newRatio !== ratio) {
      e.preventDefault()
      setRatio(newRatio)
    }
  }

  const leftWidth = `${ratio * 100}%`
  const rightWidth = `${(1 - ratio) * 100}%`

  return (
    <div
      ref={ref ?? containerRef}
      className={`${styles.container} ${className}`}
      style={{
        gridTemplateColumns: `${leftWidth} auto ${rightWidth}`,
      }}
    >
      {/* 左側コンテンツ */}
      <div className={styles.pane}>{left}</div>

      {/* リサイズハンドル */}
      {/* biome-ignore lint/a11y/useSemanticElements: Custom resizable divider requires role="separator" */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        className={styles.handle}
        data-dragging={isDragging ? "" : undefined}
        role='separator'
        tabIndex={0}
        aria-orientation='vertical'
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuemin={Math.round(minRatio * 100)}
        aria-valuemax={Math.round(maxRatio * 100)}
        aria-label={ariaLabel}
      >
        {/* ドラッグインジケーター */}
        <div className={styles.indicator} />
      </div>

      {/* 右側コンテンツ */}
      <div className={styles.pane}>{right}</div>
    </div>
  )
}
