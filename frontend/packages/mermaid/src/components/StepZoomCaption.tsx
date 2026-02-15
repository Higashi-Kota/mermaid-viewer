import { useEffect, useRef, useState } from "react"

import styles from "./StepZoomCaption.module.css"

export interface StepZoomCaptionProps {
  /** ステップズームがアクティブか */
  readonly isActive: boolean
  /** 現在のステップインデックス（0始まり） */
  readonly currentIndex: number
  /** 総ステップ数 */
  readonly totalSteps: number
  /** 現在のノード ID */
  readonly nodeId: string | null
  /** ノード ID → ラベルのマッピング（自動抽出） */
  readonly nodeLabels: ReadonlyMap<string, string>
  /** ノード ID → 説明文のマッピング */
  readonly descriptions?: Record<string, string>
  /** 追加 CSS クラス */
  readonly className?: string
}

export function StepZoomCaption({
  isActive,
  currentIndex,
  totalSteps,
  nodeId,
  nodeLabels,
  descriptions,
  className,
}: StepZoomCaptionProps) {
  const prevIndexRef = useRef(currentIndex)
  const directionRef = useRef<"down" | "up">("down")
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    if (currentIndex !== prevIndexRef.current) {
      directionRef.current = currentIndex > prevIndexRef.current ? "down" : "up"
      prevIndexRef.current = currentIndex
      setAnimationKey((k) => k + 1)
    }
  }, [currentIndex])

  if (!isActive || nodeId == null) return null

  const displayLabel = nodeLabels.get(nodeId) ?? nodeId
  const description = descriptions?.[nodeId] ?? null

  const animationClass = directionRef.current === "down" ? styles.slideDown : styles.slideUp

  return (
    <div className={`${styles.container}${className ? ` ${className}` : ""}`}>
      <div key={animationKey} className={animationClass}>
        <div className={styles.stepNumber}>
          Step {currentIndex + 1} / {totalSteps}
        </div>
        <h2 className={styles.label}>{displayLabel}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </div>
    </div>
  )
}
