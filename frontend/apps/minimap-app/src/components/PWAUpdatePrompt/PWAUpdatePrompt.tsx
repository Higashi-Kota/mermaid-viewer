import { useRegisterSW } from "virtual:pwa-register/react"
import { useAppTranslation } from "@mermaid-demo/messages"
import { RefreshCw, X } from "lucide-react"
import { useEffect, useRef } from "react"
import styles from "./PWAUpdatePrompt.module.css"

/**
 * PWA Update Prompt Component
 *
 * Displays a toast notification when a new version of the app is available.
 */
export function PWAUpdatePrompt() {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)
  const { t } = useAppTranslation()

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      registrationRef.current = r ?? null
    },
    onRegisterError(_error) {
      // Service Worker registration failed
    },
  })

  // Check for updates when page becomes visible (returning from background)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && registrationRef.current) {
        registrationRef.current.update()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  if (!needRefresh) return null

  return (
    <output aria-live='polite' className={styles.container}>
      <div className={styles.toast}>
        <div className={styles.icon}>
          <RefreshCw size={16} strokeWidth={2} aria-hidden='true' />
        </div>
        <div className={styles.content}>
          <span className={styles.title}>{t("pwa.updateAvailable")}</span>
          <span className={styles.subtitle}>{t("pwa.newFeatures")}</span>
        </div>
        <div className={styles.actions}>
          <button
            type='button'
            onClick={() => updateServiceWorker(true)}
            className={styles.updateBtn}
          >
            {t("pwa.updateNow")}
          </button>
          <button
            type='button'
            onClick={() => setNeedRefresh(false)}
            className={styles.dismissBtn}
            aria-label={t("pwa.later")}
          >
            <X size={14} strokeWidth={2} aria-hidden='true' />
          </button>
        </div>
      </div>
    </output>
  )
}
