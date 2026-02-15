import { useEffect, useRef } from "react"

import styles from "./StepListEditor.module.css"

export interface StepListEditorProps {
  /** ノード ID の配列（初出順） */
  readonly nodeIds: readonly string[]
  /** ノード ID → ラベルのマッピング */
  readonly nodeLabels: ReadonlyMap<string, string>
  /** ノード ID → 説明文のマッピング */
  readonly descriptions: Record<string, string>
  /** 説明文変更コールバック */
  readonly onDescriptionChange: (nodeId: string, description: string) => void
  /** ステップズームがアクティブか */
  readonly isActive: boolean
  /** 現在のステップインデックス（0始まり） */
  readonly currentIndex: number
  /** ステップクリック時のコールバック */
  readonly onStepClick: (index: number) => void
  /** textarea の id/name プレフィックス（複数インスタンスの id 重複回避） */
  readonly idPrefix?: string
  /** 追加 CSS クラス */
  readonly className?: string
}

export function StepListEditor({
  nodeIds,
  nodeLabels,
  descriptions,
  onDescriptionChange,
  isActive,
  currentIndex,
  onStepClick,
  idPrefix = "step",
  className,
}: StepListEditorProps) {
  const listRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to current step during active step zoom
  useEffect(() => {
    if (!isActive || !listRef.current) return
    const activeItem = listRef.current.querySelector(`[data-step-index="${currentIndex}"]`)
    if (activeItem) {
      activeItem.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }
  }, [isActive, currentIndex])

  if (nodeIds.length === 0) return null

  return (
    <div className={`${styles.container}${className ? ` ${className}` : ""}`}>
      <h3 className={styles.heading}>Steps</h3>
      <div ref={listRef} className={styles.list}>
        {nodeIds.map((nodeId, index) => {
          const label = nodeLabels.get(nodeId) ?? nodeId
          const isCurrent = isActive && index === currentIndex
          return (
            <div
              key={nodeId}
              data-step-index={index}
              data-current={isCurrent ? "" : undefined}
              className={styles.item}
            >
              <button
                type='button'
                className={styles.stepHeader}
                onClick={() => onStepClick(index)}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span className={styles.stepNumber}>{index + 1}</span>
                <span className={styles.stepLabel}>{label}</span>
              </button>
              <textarea
                id={`${idPrefix}-description-${nodeId}`}
                name={`${idPrefix}-description-${nodeId}`}
                className={styles.descriptionInput}
                value={descriptions[nodeId] ?? ""}
                onChange={(e) => onDescriptionChange(nodeId, e.target.value.slice(0, 200))}
                placeholder='Add description...'
                aria-label={`${label} description`}
                maxLength={200}
                rows={2}
              />
              <span className={styles.charCount}>{(descriptions[nodeId] ?? "").length}/200</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
