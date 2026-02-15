import type { ComponentProps, ReactNode, Ref } from "react"

import styles from "./IconButton.module.css"

export type IconButtonSize = "sm" | "md" | "lg"

export interface IconButtonProps extends ComponentProps<"button"> {
  readonly icon: ReactNode
  readonly "aria-label": string
  readonly size?: IconButtonSize
  readonly pressed?: boolean
  readonly ref?: Ref<HTMLButtonElement>
}

export function IconButton({
  icon,
  "aria-label": ariaLabel,
  size = "md",
  pressed,
  className = "",
  ref,
  ...props
}: IconButtonProps) {
  return (
    <button
      ref={ref}
      type='button'
      className={`${styles.button} ${styles[size]} ${className}`}
      aria-label={ariaLabel}
      aria-pressed={pressed}
      {...props}
    >
      {icon}
    </button>
  )
}
