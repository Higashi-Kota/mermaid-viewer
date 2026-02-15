import type { Ref } from "react"

import styles from "./ToggleGroup.module.css"

export interface ToggleGroupItem {
  readonly value: string
  readonly label: string
}

export interface ToggleGroupProps {
  readonly name: string
  readonly items: readonly ToggleGroupItem[]
  readonly value: string
  readonly onChange: (value: string) => void
  readonly "aria-label": string
  readonly orientation?: "horizontal" | "vertical"
  readonly className?: string
  readonly ref?: Ref<HTMLDivElement>
}

export function ToggleGroup({
  items,
  value,
  onChange,
  "aria-label": ariaLabel,
  orientation = "horizontal",
  className = "",
  ref,
}: ToggleGroupProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const currentIndex = items.findIndex((item) => item.value === value)
    if (currentIndex === -1) return

    let nextIndex: number | null = null

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault()
      nextIndex = (currentIndex + 1) % items.length
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault()
      nextIndex = (currentIndex - 1 + items.length) % items.length
    } else if (e.key === "Home") {
      e.preventDefault()
      nextIndex = 0
    } else if (e.key === "End") {
      e.preventDefault()
      nextIndex = items.length - 1
    }

    if (nextIndex !== null) {
      const nextItem = items[nextIndex]
      if (!nextItem) return
      onChange(nextItem.value)
      const container = e.currentTarget
      const buttons = container.querySelectorAll<HTMLButtonElement>('[role="radio"]')
      buttons[nextIndex]?.focus()
    }
  }

  return (
    <div
      ref={ref}
      role='radiogroup'
      aria-label={ariaLabel}
      className={`${styles.group} ${className}`}
      data-orientation={orientation}
      onKeyDown={handleKeyDown}
    >
      {items.map((item) => {
        const isSelected = item.value === value
        return (
          // biome-ignore lint/a11y/useSemanticElements: WAI-ARIA APG Radio Group pattern uses button[role="radio"] for roving tabindex
          <button
            key={item.value}
            type='button'
            role='radio'
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            data-selected={isSelected ? "" : undefined}
            className={styles.item}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
