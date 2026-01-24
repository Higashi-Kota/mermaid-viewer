import { useAppTranslation } from "@mermaid-demo/messages"
import { Check, Link2 } from "lucide-react"
import { useState } from "react"
import styles from "../App.module.css"
import { useShareUrl } from "../hooks/useShareUrl"

interface ShareButtonProps {
  readonly definition: string
}

export function ShareButton({ definition }: ShareButtonProps) {
  const { t } = useAppTranslation()
  const { copyShareUrl } = useShareUrl()
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    const success = await copyShareUrl(definition)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      type='button'
      className={styles.iconLink}
      onClick={handleClick}
      aria-label={copied ? t("share.copied") : t("share.button")}
      title={copied ? t("share.copied") : t("share.button")}
    >
      {copied ? <Check size={20} aria-hidden='true' /> : <Link2 size={20} aria-hidden='true' />}
    </button>
  )
}
