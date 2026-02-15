import type { ComponentProps, ReactNode, Ref } from "react"

import styles from "./Button.module.css"

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive"
export type ButtonSize = "sm" | "md" | "lg"

export interface ButtonProps extends ComponentProps<"button"> {
  readonly variant?: ButtonVariant
  readonly size?: ButtonSize
  readonly iconBefore?: ReactNode
  readonly iconAfter?: ReactNode
  readonly ref?: Ref<HTMLButtonElement>
}

export function Button({
  variant = "primary",
  size = "md",
  iconBefore,
  iconAfter,
  className = "",
  children,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type='button'
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      {...props}
    >
      {iconBefore && (
        <span className={styles.icon} aria-hidden='true'>
          {iconBefore}
        </span>
      )}
      {children && <span className={styles.label}>{children}</span>}
      {iconAfter && (
        <span className={styles.icon} aria-hidden='true'>
          {iconAfter}
        </span>
      )}
    </button>
  )
}
