import { useEffect, useMemo, useState } from "react"
import styles from "./ErrorFallback.module.css"
import { buildErrorReport, copyTextToClipboard } from "./errorReporting"

type GlobalErrorState = {
  error: unknown
  source: string
}

export function GlobalErrorOverlay() {
  const [state, setState] = useState<GlobalErrorState | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    function handleError(event: ErrorEvent) {
      const error = event.error ?? new Error(event.message || "Unknown error")
      setState({ error, source: "window.error" })
      console.error("Global error captured:", event)
    }

    function handleRejection(event: PromiseRejectionEvent) {
      setState({
        error: event.reason ?? new Error("Unhandled rejection"),
        source: "unhandledrejection",
      })
      console.error("Unhandled promise rejection:", event.reason)
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleRejection)
    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleRejection)
    }
  }, [])

  const report = useMemo(() => {
    if (!state) return null
    return buildErrorReport(state.error, { source: state.source })
  }, [state])

  const handleReload = () => {
    window.location.reload()
  }

  const handleCopy = async () => {
    if (!report) return
    await copyTextToClipboard(report)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  if (!state || !report) return null

  return (
    <div className={styles.root} role='alert'>
      <div className={styles.card}>
        <h1 className={styles.title}>Runtime error detected</h1>
        <p className={styles.message}>
          A global error was captured. You can reload or copy the details to share.
        </p>
        <div className={styles.actions}>
          <button
            type='button'
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={handleReload}
          >
            Reload
          </button>
          <button type='button' className={styles.button} onClick={handleCopy}>
            {copied ? "Copied" : "Copy details"}
          </button>
        </div>
        <details className={styles.details} open>
          <summary>Details</summary>
          <div className={styles.detailsContent}>
            <textarea
              className={styles.textarea}
              readOnly
              value={report}
              aria-label='Error report'
            />
            <pre className={styles.pre}>{report}</pre>
          </div>
        </details>
      </div>
    </div>
  )
}
