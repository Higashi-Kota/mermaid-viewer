import { FileCode, Image, Loader2 } from "lucide-react"
import { useState } from "react"
import styles from "./ExportControls.module.css"

export interface ExportControlsProps {
  onExportSvg: () => void
  onExportPng: () => Promise<void>
  className?: string
}

export function ExportControls({ onExportSvg, onExportPng, className = "" }: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPng = async () => {
    setIsExporting(true)
    try {
      await onExportPng()
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className={[styles.controls, className].filter(Boolean).join(" ")}>
      <button
        type='button'
        onClick={onExportSvg}
        className={styles.btn}
        aria-label='Download as SVG'
        title='Download SVG'
      >
        <FileCode size={14} aria-hidden='true' />
        <span>SVG</span>
      </button>
      <button
        type='button'
        onClick={handleExportPng}
        disabled={isExporting}
        className={[styles.btn, isExporting && styles.disabled].filter(Boolean).join(" ")}
        aria-label='Download as PNG'
        title='Download PNG'
      >
        {isExporting ? (
          <Loader2 size={14} className={styles.spin} aria-hidden='true' />
        ) : (
          <Image size={14} aria-hidden='true' />
        )}
        <span>PNG</span>
      </button>
    </div>
  )
}
