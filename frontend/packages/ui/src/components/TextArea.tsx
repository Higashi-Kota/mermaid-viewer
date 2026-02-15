import type { ComponentProps, Ref } from "react"

import styles from "./TextArea.module.css"

export interface TextAreaProps extends ComponentProps<"textarea"> {
  readonly ref?: Ref<HTMLTextAreaElement>
}

export function TextArea({ className = "", ref, ...props }: TextAreaProps) {
  return <textarea ref={ref} className={`${styles.textarea} ${className}`} {...props} />
}
