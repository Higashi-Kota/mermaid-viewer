import LZString from "lz-string"
import { useCallback } from "react"

interface ShareState {
  definition: string
}

/**
 * Get initial state from URL (call once before component mounts)
 * Returns the definition if found in URL params, otherwise null
 */
export function getInitialShareState(): ShareState | null {
  if (typeof window === "undefined") return null

  const params = new URLSearchParams(window.location.search)
  const code = params.get("code")
  if (!code) return null

  try {
    const definition = LZString.decompressFromEncodedURIComponent(code)
    if (!definition) return null
    return { definition }
  } catch {
    return null
  }
}

export function useShareUrl() {
  // Parse URL on mount
  const getShareStateFromUrl = useCallback((): ShareState | null => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    if (!code) return null

    try {
      const definition = LZString.decompressFromEncodedURIComponent(code)
      if (!definition) return null
      return { definition }
    } catch {
      return null
    }
  }, [])

  // Generate share URL
  const generateShareUrl = useCallback((definition: string): string => {
    const compressed = LZString.compressToEncodedURIComponent(definition)
    const url = new URL(window.location.href)
    url.search = "" // Clear existing params
    url.searchParams.set("code", compressed)
    return url.toString()
  }, [])

  // Copy to clipboard
  const copyShareUrl = useCallback(
    async (definition: string): Promise<boolean> => {
      try {
        const url = generateShareUrl(definition)
        await navigator.clipboard.writeText(url)
        return true
      } catch {
        return false
      }
    },
    [generateShareUrl],
  )

  // Clear URL params (after restoring state)
  const clearUrlParams = useCallback(() => {
    const url = new URL(window.location.href)
    url.search = ""
    window.history.replaceState({}, "", url.toString())
  }, [])

  return {
    getShareStateFromUrl,
    generateShareUrl,
    copyShareUrl,
    clearUrlParams,
  }
}
