import type { ErrorInfo, ReactNode } from "react"
import { Component } from "react"
import styles from "./ErrorFallback.module.css"
import { buildErrorReport, copyTextToClipboard } from "./errorReporting"

type RootErrorBoundaryProps = {
  children: ReactNode
}

type RootErrorBoundaryState = {
  error: Error | null
  componentStack: string | null
  report: string | null
  copied: boolean
}

export class RootErrorBoundary extends Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  override state: RootErrorBoundaryState = {
    error: null,
    componentStack: null,
    report: null,
    copied: false,
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    const componentStack = info.componentStack ?? null
    const report = buildErrorReport(error, { componentStack })
    this.setState({ componentStack, report })
    console.error("RootErrorBoundary caught an error:", error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleCopy = async () => {
    const { report } = this.state
    if (!report) return
    await copyTextToClipboard(report)
    this.setState({ copied: true })
    window.setTimeout(() => this.setState({ copied: false }), 1500)
  }

  override render() {
    const { error, report, copied } = this.state
    if (!error) return this.props.children

    return (
      <div className={styles.root} role='alert'>
        <div className={styles.card}>
          <h1 className={styles.title}>Something went wrong</h1>
          <p className={styles.message}>
            The app hit a runtime error. You can reload or copy the details to share.
          </p>
          <div className={styles.actions}>
            <button
              type='button'
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={this.handleReload}
            >
              Reload
            </button>
            <button type='button' className={styles.button} onClick={this.handleCopy}>
              {copied ? "Copied" : "Copy details"}
            </button>
          </div>
          {report && (
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
          )}
        </div>
      </div>
    )
  }
}
