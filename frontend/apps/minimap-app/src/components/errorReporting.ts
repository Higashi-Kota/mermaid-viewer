export type ErrorReportOptions = {
  source?: string
  componentStack?: string | null
}

function safeStringify(value: unknown) {
  try {
    return typeof value === "string" ? value : JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function buildErrorReport(error: unknown, options: ErrorReportOptions = {}) {
  const safeError = error instanceof Error ? error : new Error(safeStringify(error))
  const parts = [
    `time: ${new Date().toISOString()}`,
    `url: ${window.location.href}`,
    `userAgent: ${navigator.userAgent}`,
    options.source ? `source: ${options.source}` : null,
    `message: ${safeError.message}`,
    safeError.stack ? `stack:\n${safeError.stack}` : null,
    options.componentStack ? `componentStack:\n${options.componentStack}` : null,
  ].filter(Boolean)

  return parts.join("\n")
}

export function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
  }

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "true")
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand("copy")
  document.body.removeChild(textarea)
  return Promise.resolve()
}
