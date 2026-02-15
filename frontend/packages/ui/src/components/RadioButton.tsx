import type { ComponentProps, Ref } from "react"

import styles from "./RadioButton.module.css"

export interface RadioButtonProps extends Omit<ComponentProps<"input">, "type"> {
  readonly label: string
  readonly ref?: Ref<HTMLInputElement>
}

export function RadioButton({ label, className = "", ref, id, ...props }: RadioButtonProps) {
  return (
    <label className={`${styles.label} ${className}`} htmlFor={id}>
      <input ref={ref} type='radio' id={id} className={styles.input} {...props} />
      <span className={styles.indicator} aria-hidden='true' />
      <span className={styles.text}>{label}</span>
    </label>
  )
}
