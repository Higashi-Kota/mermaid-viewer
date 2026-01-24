import { Maximize2 } from "lucide-react"
import mermaid from "mermaid"
import { useEffect, useRef, useState } from "react"

import { exportPng, exportSvg, generateFilename } from "../core/export"
import { touchListToPoints } from "../core/pinchGesture"
import { DEFAULT_ZOOM_CONSTRAINTS, toTransformCSS } from "../core/transform"
import { parseSvgDimensions } from "../core/viewport"
import { useMermaidStore } from "../store/useMermaidStore"
import type { MermaidViewerProps, SvgDimensions } from "../types"

import { FullscreenOverlay } from "./FullscreenOverlay"
import styles from "./MermaidViewer.module.css"
import { Minimap } from "./Minimap"
import { ZoomControls } from "./ZoomControls"

/**
 * Normalize SVG to have explicit width/height matching viewBox dimensions
 *
 * Mermaid generates SVGs with width="100%" which causes the SVG to render
 * at container size instead of its natural dimensions. This function sets
 * explicit pixel dimensions matching the viewBox for predictable sizing.
 */
function normalizeSvgDimensions(svgHtml: string, dims: SvgDimensions): string {
  let result = svgHtml

  // Replace or add width attribute
  if (/(<svg[^>]*)\s+width="[^"]*"/.test(result)) {
    result = result.replace(/(<svg[^>]*)\s+width="[^"]*"/, `$1 width="${dims.width}"`)
  } else {
    result = result.replace(/<svg/, `<svg width="${dims.width}"`)
  }

  // Replace or add height attribute
  if (/(<svg[^>]*)\s+height="[^"]*"/.test(result)) {
    result = result.replace(/(<svg[^>]*)\s+height="[^"]*"/, `$1 height="${dims.height}"`)
  } else {
    result = result.replace(/<svg/, `<svg height="${dims.height}"`)
  }

  return result
}

// Track mermaid theme to detect changes
let currentMermaidTheme: "default" | "dark" = "default"

function initMermaid(isDark: boolean) {
  const targetTheme = isDark ? "dark" : "default"

  // Re-initialize if theme changed
  if (currentMermaidTheme !== targetTheme) {
    currentMermaidTheme = targetTheme
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: targetTheme,
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      suppressErrorRendering: true,
    })
  }
}

/**
 * Hook to detect theme from document's data-theme attribute
 */
function useDocumentTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light"
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light"
  })

  useEffect(() => {
    function updateTheme() {
      const newTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light"
      setTheme(newTheme)
    }

    // Observe data-theme attribute changes
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    })

    // Initial check
    updateTheme()

    return () => observer.disconnect()
  }, [])

  return theme
}

// Counter for unique IDs
let idCounter = 0

/**
 * Mermaid diagram viewer with inline pan-zoom and minimap support
 *
 * Renders mermaid diagrams with:
 * - Inline pan-zoom (mouse drag panning, mouse wheel zooming)
 * - Minimap navigation
 * - Zoom controls
 * - Optional fullscreen mode via button
 *
 * Requires a MermaidStore instance for state management.
 * Create with MermaidStore.create() at the parent component level.
 */
export function MermaidViewer({
  definition,
  id,
  className = "",
  showControls = true,
  showMinimap = true,
  showFullscreenButton = true,
  onFullscreenChange,
  zoomConstraints = DEFAULT_ZOOM_CONSTRAINTS,
  store,
}: MermaidViewerProps) {
  // Refs
  const contentRef = useRef<HTMLDivElement>(null)
  const svgWrapperRef = useRef<HTMLDivElement>(null)
  const fullscreenContentRef = useRef<HTMLDivElement>(null)

  // Handler refs for wheel events (Handler Ref Pattern)
  const wheelHandlerRef = useRef<((e: WheelEvent) => void) | null>(null)
  const fullscreenWheelHandlerRef = useRef<((e: WheelEvent) => void) | null>(null)

  // Handler refs for touch events (Handler Ref Pattern)
  const touchHandlerRef = useRef<{
    handleTouchStart: (e: TouchEvent) => void
    handleTouchMove: (e: TouchEvent) => void
    handleTouchEnd: (e: TouchEvent) => void
  } | null>(null)
  const fullscreenTouchHandlerRef = useRef<{
    handleTouchStart: (e: TouchEvent) => void
    handleTouchMove: (e: TouchEvent) => void
    handleTouchEnd: (e: TouchEvent) => void
  } | null>(null)

  // Subscribe to store
  const snapshot = useMermaidStore(store)

  // Detect theme from document
  const documentTheme = useDocumentTheme()

  // Generate unique ID (include theme to force re-render on theme change)
  const baseId = useRef(id ?? `mermaid-viewer-${++idCounter}`).current
  const diagramId = `${baseId}-${documentTheme}`

  // Render mermaid diagram
  useEffect(() => {
    if (!definition.trim()) {
      store.resetRenderState()
      return
    }

    let cancelled = false
    store.setLoading()

    initMermaid(documentTheme === "dark")

    mermaid
      .render(diagramId, definition)
      .then(({ svg }) => {
        if (cancelled) return

        // Parse SVG dimensions from viewBox
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = svg
        const svgEl = tempDiv.querySelector("svg")
        if (svgEl) {
          const dims = parseSvgDimensions(svgEl)
          // Normalize SVG to have explicit width/height matching viewBox
          // This ensures the SVG renders at its natural size, not container size
          const normalizedSvg = normalizeSvgDimensions(svg, dims)
          store.setSuccess(normalizedSvg, dims)
        } else {
          // Fallback: use svg as-is with default dimensions
          store.setSuccess(svg, { width: 800, height: 600, minX: 0, minY: 0 })
        }
      })
      .catch((err) => {
        if (cancelled) return
        store.setError(err instanceof Error ? err.message : "Failed to render diagram")
      })

    return () => {
      cancelled = true
    }
  }, [definition, diagramId, store, documentTheme])

  // Initialize pan-zoom when SVG is rendered (inline mode)
  useEffect(() => {
    if (!snapshot.svgDimensions || !contentRef.current) return

    const viewportWidth = contentRef.current.clientWidth
    const viewportHeight = contentRef.current.clientHeight

    // Only initialize if viewport has size and pan-zoom is not already initialized
    if (
      viewportWidth > 0 &&
      viewportHeight > 0 &&
      snapshot.zoom === 1 &&
      snapshot.transformState.panX === 0
    ) {
      store.updateViewportSize(viewportWidth, viewportHeight)
      store.initializePanZoom(viewportWidth, viewportHeight)
    }
  }, [snapshot.svgDimensions, store, snapshot.zoom, snapshot.transformState.panX])

  // Track viewport size with ResizeObserver (inline mode)
  useEffect(() => {
    if (!contentRef.current) return

    const updateSize = () => {
      if (contentRef.current) {
        const width = contentRef.current.clientWidth
        const height = contentRef.current.clientHeight
        store.updateViewportSize(width, height)
      }
    }

    // Track size changes
    const observer = new ResizeObserver(updateSize)
    observer.observe(contentRef.current)

    return () => observer.disconnect()
  }, [store])

  // Re-initialize pan-zoom when entering fullscreen (different viewport size)
  useEffect(() => {
    if (!snapshot.isFullscreen || !snapshot.svgDimensions || !fullscreenContentRef.current) return

    const viewportWidth = fullscreenContentRef.current.clientWidth
    const viewportHeight = fullscreenContentRef.current.clientHeight

    store.updateViewportSize(viewportWidth, viewportHeight)
    store.initializePanZoomForFullscreen()
  }, [snapshot.isFullscreen, snapshot.svgDimensions, store])

  // Track fullscreen viewport size with ResizeObserver
  useEffect(() => {
    if (!snapshot.isFullscreen || !fullscreenContentRef.current) return

    const updateSize = () => {
      if (fullscreenContentRef.current) {
        store.updateViewportSize(
          fullscreenContentRef.current.clientWidth,
          fullscreenContentRef.current.clientHeight,
        )
      }
    }

    const observer = new ResizeObserver(updateSize)
    observer.observe(fullscreenContentRef.current)

    return () => observer.disconnect()
  }, [snapshot.isFullscreen, store])

  // Notify parent of fullscreen changes
  useEffect(() => {
    onFullscreenChange?.(snapshot.isFullscreen)
  }, [snapshot.isFullscreen, onFullscreenChange])

  // Open fullscreen
  function openFullscreen() {
    store.openFullscreen()
  }

  // Close fullscreen
  function closeFullscreen() {
    // Re-initialize for inline viewport after closing fullscreen
    if (contentRef.current) {
      const viewportWidth = contentRef.current.clientWidth
      const viewportHeight = contentRef.current.clientHeight
      store.updateViewportSize(viewportWidth, viewportHeight)
      store.initializePanZoom(viewportWidth, viewportHeight)
    }
    store.closeFullscreen()
  }

  // Zoom handlers (inline)
  function handleZoomIn() {
    if (!contentRef.current) return
    const rect = contentRef.current.getBoundingClientRect()
    store.zoomIn(rect.width / 2, rect.height / 2, zoomConstraints)
  }

  function handleZoomOut() {
    if (!contentRef.current) return
    const rect = contentRef.current.getBoundingClientRect()
    store.zoomOut(rect.width / 2, rect.height / 2, zoomConstraints)
  }

  function handleZoomReset() {
    store.resetZoom()
  }

  // Zoom handlers (fullscreen)
  function handleFullscreenZoomIn() {
    if (!fullscreenContentRef.current) return
    const rect = fullscreenContentRef.current.getBoundingClientRect()
    store.zoomIn(rect.width / 2, rect.height / 2, zoomConstraints)
  }

  function handleFullscreenZoomOut() {
    if (!fullscreenContentRef.current) return
    const rect = fullscreenContentRef.current.getBoundingClientRect()
    store.zoomOut(rect.width / 2, rect.height / 2, zoomConstraints)
  }

  // Mouse wheel zoom handlers - Handler Ref Pattern
  // Store handler logic in refs (always access latest store/zoomConstraints)
  wheelHandlerRef.current = (event: WheelEvent) => {
    event.preventDefault()
    const element = contentRef.current
    if (!element) return

    const rect = element.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    const factor = event.deltaY > 0 ? 0.9 : 1.1

    store.zoomByFactor(factor, mouseX, mouseY, zoomConstraints)
  }

  fullscreenWheelHandlerRef.current = (event: WheelEvent) => {
    event.preventDefault()
    const element = fullscreenContentRef.current
    if (!element) return

    const rect = element.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    const factor = event.deltaY > 0 ? 0.9 : 1.1

    store.zoomByFactor(factor, mouseX, mouseY, zoomConstraints)
  }

  // Register wheel event with passive: false (inline)
  // Handler Ref Pattern: re-register when svgContent changes (element becomes available)
  useEffect(() => {
    const element = contentRef.current
    if (!element || !snapshot.svgContent) return

    const handler = (e: WheelEvent) => wheelHandlerRef.current?.(e)
    element.addEventListener("wheel", handler, { passive: false })
    return () => element.removeEventListener("wheel", handler)
  }, [snapshot.svgContent])

  // Register wheel event with passive: false (fullscreen)
  // Handler Ref Pattern: register when fullscreen changes
  useEffect(() => {
    const element = fullscreenContentRef.current
    if (!element || !snapshot.isFullscreen) return

    const handler = (e: WheelEvent) => fullscreenWheelHandlerRef.current?.(e)
    element.addEventListener("wheel", handler, { passive: false })
    return () => element.removeEventListener("wheel", handler)
  }, [snapshot.isFullscreen])

  // Pointer drag pan (mouse/pen only - touch is handled by TouchEvents for pinch support)
  function handlePointerDown(event: React.PointerEvent) {
    // Skip touch - handled by TouchEvents for pinch zoom support
    if (event.pointerType === "touch") return
    // Left click only for mouse
    if (event.button !== 0 && event.pointerType === "mouse") return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    store.startPan(event.clientX, event.clientY)
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (event.pointerType === "touch") return
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    store.updatePan(event.clientX, event.clientY)
  }

  function handlePointerUp(event: React.PointerEvent) {
    if (event.pointerType === "touch") return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    store.endPan()
  }

  function handlePointerCancel(event: React.PointerEvent) {
    if (event.pointerType === "touch") return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    store.endPan()
  }

  // Touch event handlers - Handler Ref Pattern (inline mode)
  // Always access latest store/zoomConstraints
  touchHandlerRef.current = {
    handleTouchStart: (e: TouchEvent) => {
      e.preventDefault()
      const element = contentRef.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      const touches = touchListToPoints(e.touches, rect)

      const touch0 = touches[0]
      const touch1 = touches[1]
      if (touch0 && touch1) {
        store.startPinch([touch0, touch1])
      } else if (touch0) {
        store.startTouchPan(touch0)
      }
    },

    handleTouchMove: (e: TouchEvent) => {
      e.preventDefault()
      const element = contentRef.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      const touches = touchListToPoints(e.touches, rect)
      store.updateTouch(touches, zoomConstraints)
    },

    handleTouchEnd: (e: TouchEvent) => {
      e.preventDefault()
      const element = contentRef.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      const touches = touchListToPoints(e.touches, rect)
      const touch0 = touches[0]

      if (touches.length === 0) {
        store.endTouch()
      } else if (touch0) {
        // Pinch ended, continue with single touch pan
        store.startTouchPan(touch0)
      }
    },
  }

  // Touch event handlers (fullscreen mode)
  fullscreenTouchHandlerRef.current = {
    handleTouchStart: (e: TouchEvent) => {
      e.preventDefault()
      const element = fullscreenContentRef.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      const touches = touchListToPoints(e.touches, rect)
      const touch0 = touches[0]
      const touch1 = touches[1]

      if (touch0 && touch1) {
        store.startPinch([touch0, touch1])
      } else if (touch0) {
        store.startTouchPan(touch0)
      }
    },

    handleTouchMove: (e: TouchEvent) => {
      e.preventDefault()
      const element = fullscreenContentRef.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      const touches = touchListToPoints(e.touches, rect)
      store.updateTouch(touches, zoomConstraints)
    },

    handleTouchEnd: (e: TouchEvent) => {
      e.preventDefault()
      const element = fullscreenContentRef.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      const touches = touchListToPoints(e.touches, rect)
      const touch0 = touches[0]

      if (touches.length === 0) {
        store.endTouch()
      } else if (touch0) {
        store.startTouchPan(touch0)
      }
    },
  }

  // Register touch events with passive: false (inline mode)
  useEffect(() => {
    const element = contentRef.current
    if (!element || !snapshot.svgContent) return

    const onTouchStart = (e: TouchEvent) => touchHandlerRef.current?.handleTouchStart(e)
    const onTouchMove = (e: TouchEvent) => touchHandlerRef.current?.handleTouchMove(e)
    const onTouchEnd = (e: TouchEvent) => touchHandlerRef.current?.handleTouchEnd(e)

    element.addEventListener("touchstart", onTouchStart, { passive: false })
    element.addEventListener("touchmove", onTouchMove, { passive: false })
    element.addEventListener("touchend", onTouchEnd, { passive: false })
    element.addEventListener("touchcancel", onTouchEnd, { passive: false })

    return () => {
      element.removeEventListener("touchstart", onTouchStart)
      element.removeEventListener("touchmove", onTouchMove)
      element.removeEventListener("touchend", onTouchEnd)
      element.removeEventListener("touchcancel", onTouchEnd)
    }
  }, [snapshot.svgContent])

  // Register touch events with passive: false (fullscreen mode)
  useEffect(() => {
    const element = fullscreenContentRef.current
    if (!element || !snapshot.isFullscreen) return

    const onTouchStart = (e: TouchEvent) => fullscreenTouchHandlerRef.current?.handleTouchStart(e)
    const onTouchMove = (e: TouchEvent) => fullscreenTouchHandlerRef.current?.handleTouchMove(e)
    const onTouchEnd = (e: TouchEvent) => fullscreenTouchHandlerRef.current?.handleTouchEnd(e)

    element.addEventListener("touchstart", onTouchStart, { passive: false })
    element.addEventListener("touchmove", onTouchMove, { passive: false })
    element.addEventListener("touchend", onTouchEnd, { passive: false })
    element.addEventListener("touchcancel", onTouchEnd, { passive: false })

    return () => {
      element.removeEventListener("touchstart", onTouchStart)
      element.removeEventListener("touchmove", onTouchMove)
      element.removeEventListener("touchend", onTouchEnd)
      element.removeEventListener("touchcancel", onTouchEnd)
    }
  }, [snapshot.isFullscreen])

  // Block iOS Safari native pinch zoom (gesturestart/gesturechange events)
  useEffect(() => {
    const element = contentRef.current
    if (!element || !snapshot.svgContent) return

    const preventGesture = (e: Event) => e.preventDefault()
    element.addEventListener("gesturestart", preventGesture)
    element.addEventListener("gesturechange", preventGesture)

    return () => {
      element.removeEventListener("gesturestart", preventGesture)
      element.removeEventListener("gesturechange", preventGesture)
    }
  }, [snapshot.svgContent])

  // Block iOS Safari native pinch zoom (fullscreen mode)
  useEffect(() => {
    const element = fullscreenContentRef.current
    if (!element || !snapshot.isFullscreen) return

    const preventGesture = (e: Event) => e.preventDefault()
    element.addEventListener("gesturestart", preventGesture)
    element.addEventListener("gesturechange", preventGesture)

    return () => {
      element.removeEventListener("gesturestart", preventGesture)
      element.removeEventListener("gesturechange", preventGesture)
    }
  }, [snapshot.isFullscreen])

  // Export handlers (inline functions per project guidelines - NO useCallback)
  function handleExportSvg() {
    if (snapshot.svgContent) {
      exportSvg(snapshot.svgContent, generateFilename("svg"))
    }
  }

  async function handleExportPng() {
    const svgElement = svgWrapperRef.current?.querySelector("svg")
    if (svgElement) {
      await exportPng(svgElement as SVGElement, {
        filename: generateFilename("png"),
        scale: 2,
      })
    }
  }

  // Loading state
  if (snapshot.isLoading) {
    return (
      <div className={[styles.loading, className].filter(Boolean).join(" ")}>
        <div className={styles.spinner} />
        <span>Rendering diagram...</span>
      </div>
    )
  }

  // Error state
  if (snapshot.isError) {
    return (
      <div className={[styles.error, className].filter(Boolean).join(" ")}>
        <div className={styles.errorTitle}>Failed to render diagram</div>
        <pre className={styles.errorDetails}>{snapshot.errorMessage}</pre>
      </div>
    )
  }

  // Empty/idle state
  if (!snapshot.svgContent) {
    return null
  }

  const { svgContent, svgDimensions, transformState, isPanning } = snapshot
  const viewportSize = snapshot.panZoom.viewportSize

  return (
    <>
      {/* Inline viewer with pan-zoom */}
      <div className={[styles.viewer, className].filter(Boolean).join(" ")}>
        {/* Pan-Zoom content area */}
        <div
          ref={contentRef}
          role='application'
          aria-label='Pan and zoom diagram area'
          className={[styles.content, isPanning && styles.panning].filter(Boolean).join(" ")}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onPointerLeave={handlePointerUp}
        >
          <div
            ref={svgWrapperRef}
            className={styles.wrapper}
            style={{ transform: toTransformCSS(transformState) }}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Mermaid SVG output
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>

        {/* Zoom controls */}
        {showControls && (
          <ZoomControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            currentZoom={transformState.zoom}
          />
        )}

        {/* Minimap */}
        {showMinimap && svgContent && svgDimensions && (
          <Minimap
            svgContent={svgContent}
            contentWidth={svgDimensions.width}
            contentHeight={svgDimensions.height}
            contentOriginX={svgDimensions.minX}
            contentOriginY={svgDimensions.minY}
            transformState={transformState}
            viewportWidth={viewportSize.width}
            viewportHeight={viewportSize.height}
            onNavigate={(state) => store.setTransform(state)}
          />
        )}

        {/* Fullscreen button */}
        {showFullscreenButton && (
          <button
            type='button'
            className={styles.fullscreenButton}
            onClick={openFullscreen}
            aria-label='Open fullscreen'
            title='Open fullscreen'
          >
            <Maximize2 size={16} aria-hidden='true' />
          </button>
        )}
      </div>

      {/* Fullscreen overlay */}
      <FullscreenOverlay
        isOpen={snapshot.isFullscreen}
        onClose={closeFullscreen}
        onExportSvg={handleExportSvg}
        onExportPng={handleExportPng}
      >
        <div
          ref={fullscreenContentRef}
          role='application'
          aria-label='Pan and zoom diagram area'
          className={[styles.fullscreenContent, isPanning && styles.panning]
            .filter(Boolean)
            .join(" ")}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onPointerLeave={handlePointerUp}
        >
          <div
            className={styles.wrapper}
            style={{ transform: toTransformCSS(transformState) }}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Mermaid SVG output
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>

        {showControls && (
          <ZoomControls
            onZoomIn={handleFullscreenZoomIn}
            onZoomOut={handleFullscreenZoomOut}
            onZoomReset={handleZoomReset}
            currentZoom={transformState.zoom}
          />
        )}

        {showMinimap && svgContent && svgDimensions && (
          <Minimap
            svgContent={svgContent}
            contentWidth={svgDimensions.width}
            contentHeight={svgDimensions.height}
            contentOriginX={svgDimensions.minX}
            contentOriginY={svgDimensions.minY}
            transformState={transformState}
            viewportWidth={viewportSize.width}
            viewportHeight={viewportSize.height}
            onNavigate={(state) => store.setTransform(state)}
          />
        )}
      </FullscreenOverlay>
    </>
  )
}
