import { describe, expect, it } from "vitest"

import type { TransformState } from "../types"
import {
  calculateStepZoomTarget,
  easeInOutCubic,
  interpolateTransform,
  STEP_ZOOM_DURATION,
} from "./stepZoomAnimation"

describe("easeInOutCubic", () => {
  it("returns 0 at t=0", () => {
    expect(easeInOutCubic(0)).toBe(0)
  })

  it("returns 1 at t=1", () => {
    expect(easeInOutCubic(1)).toBe(1)
  })

  it("returns 0.5 at t=0.5 (midpoint symmetry)", () => {
    expect(easeInOutCubic(0.5)).toBe(0.5)
  })

  it("is monotonically increasing (100-point sampling)", () => {
    let prev = 0
    for (let i = 1; i <= 100; i++) {
      const t = i / 100
      const val = easeInOutCubic(t)
      expect(val).toBeGreaterThanOrEqual(prev)
      prev = val
    }
  })

  it("output is in [0,1] range for t in [0,1]", () => {
    for (let i = 0; i <= 100; i++) {
      const t = i / 100
      const val = easeInOutCubic(t)
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(1)
    }
  })

  it("first half matches 4*t^3 formula", () => {
    const t = 0.25
    expect(easeInOutCubic(t)).toBeCloseTo(4 * t * t * t)
  })

  it("second half matches 1 - (-2t+2)^3/2 formula", () => {
    const t = 0.75
    const expected = 1 - (-2 * t + 2) ** 3 / 2
    expect(easeInOutCubic(t)).toBeCloseTo(expected)
  })
})

describe("calculateStepZoomTarget", () => {
  it("centers node in viewport", () => {
    const bbox = { x: 200, y: 100, width: 100, height: 50 }
    const result = calculateStepZoomTarget(bbox, 800, 600)

    // Node center = (250, 125)
    // panX = vpW/2 - centerX * zoom, panY = vpH/2 - centerY * zoom
    const nodeCenterX = 250
    const nodeCenterY = 125
    expect(result.panX).toBeCloseTo(800 / 2 - nodeCenterX * result.zoom)
    expect(result.panY).toBeCloseTo(600 / 2 - nodeCenterY * result.zoom)
  })

  it("wide node fits by width", () => {
    // Node wider than viewport aspect ratio
    const bbox = { x: 0, y: 0, width: 400, height: 50 }
    const result = calculateStepZoomTarget(bbox, 800, 600)

    // Padding = max(400,50) * 0.15 = 60
    // paddedWidth = 400 + 120 = 520
    // zoom = (800 / 520) * 0.85
    const padding = 400 * 0.15
    const paddedWidth = 400 + padding * 2
    const expected = (800 / paddedWidth) * 0.85
    expect(result.zoom).toBeCloseTo(expected)
  })

  it("tall node fits by height", () => {
    // Node taller than viewport aspect ratio
    const bbox = { x: 0, y: 0, width: 50, height: 400 }
    const result = calculateStepZoomTarget(bbox, 800, 600)

    const padding = 400 * 0.15
    const paddedHeight = 400 + padding * 2
    const expected = (600 / paddedHeight) * 0.85
    expect(result.zoom).toBeCloseTo(expected)
  })

  it("zoom is clamped to MIN_FOCUS_ZOOM (0.5)", () => {
    // Very large node that requires tiny zoom
    const bbox = { x: 0, y: 0, width: 5000, height: 5000 }
    const result = calculateStepZoomTarget(bbox, 800, 600)
    expect(result.zoom).toBe(0.5)
  })

  it("zoom is clamped to MAX_FOCUS_ZOOM (4.0)", () => {
    // Very small node that would require huge zoom
    const bbox = { x: 0, y: 0, width: 1, height: 1 }
    const result = calculateStepZoomTarget(bbox, 800, 600)
    expect(result.zoom).toBe(4.0)
  })

  it("padding ratio is 0.15 of max dimension", () => {
    const bbox = { x: 0, y: 0, width: 200, height: 100 }
    const result = calculateStepZoomTarget(bbox, 800, 600)

    // padding = max(200, 100) * 0.15 = 30
    const padding = 200 * 0.15
    const paddedWidth = 200 + padding * 2
    const paddedHeight = 100 + padding * 2

    // Verify by back-computing expected zoom
    const canvasRatio = 800 / 600
    const nodeRatio = paddedWidth / paddedHeight
    const expectedZoom =
      nodeRatio > canvasRatio ? (800 / paddedWidth) * 0.85 : (600 / paddedHeight) * 0.85
    expect(result.zoom).toBeCloseTo(expectedZoom)
  })

  it("returns TransformState with all three fields", () => {
    const bbox = { x: 0, y: 0, width: 100, height: 50 }
    const result = calculateStepZoomTarget(bbox, 800, 600)
    expect(result).toHaveProperty("zoom")
    expect(result).toHaveProperty("panX")
    expect(result).toHaveProperty("panY")
    expect(typeof result.zoom).toBe("number")
    expect(typeof result.panX).toBe("number")
    expect(typeof result.panY).toBe("number")
  })

  it("square node in square viewport", () => {
    const bbox = { x: 0, y: 0, width: 100, height: 100 }
    const result = calculateStepZoomTarget(bbox, 500, 500)

    const padding = 100 * 0.15
    const paddedSize = 100 + padding * 2
    const expectedZoom = (500 / paddedSize) * 0.85
    expect(result.zoom).toBeCloseTo(expectedZoom)
  })
})

describe("interpolateTransform", () => {
  const from: TransformState = { zoom: 1, panX: 0, panY: 0 }
  const to: TransformState = { zoom: 2, panX: 100, panY: 200 }

  it("progress=0 returns from state", () => {
    const result = interpolateTransform(from, to, 0)
    expect(result.zoom).toBeCloseTo(from.zoom)
    expect(result.panX).toBeCloseTo(from.panX)
    expect(result.panY).toBeCloseTo(from.panY)
  })

  it("progress=1 returns to state", () => {
    const result = interpolateTransform(from, to, 1)
    expect(result.zoom).toBeCloseTo(to.zoom)
    expect(result.panX).toBeCloseTo(to.panX)
    expect(result.panY).toBeCloseTo(to.panY)
  })

  it("progress=0.5 returns midpoint (eased at 0.5 = 0.5)", () => {
    const result = interpolateTransform(from, to, 0.5)
    // easeInOutCubic(0.5) = 0.5, so linear midpoint
    expect(result.zoom).toBeCloseTo(1.5)
    expect(result.panX).toBeCloseTo(50)
    expect(result.panY).toBeCloseTo(100)
  })

  it("interpolation applies easing (not linear) at progress=0.25", () => {
    const result = interpolateTransform(from, to, 0.25)
    // easeInOutCubic(0.25) = 4 * 0.25^3 = 0.0625
    // Linear would give 0.25 of the way
    // Eased zoom = 1 + 1 * 0.0625 = 1.0625
    expect(result.zoom).toBeCloseTo(1 + 1 * easeInOutCubic(0.25))
    // Confirm it differs from linear
    expect(result.zoom).not.toBeCloseTo(1.25)
  })

  it("all three fields (zoom, panX, panY) are interpolated", () => {
    const result = interpolateTransform(from, to, 0.7)
    expect(result.zoom).toBeGreaterThan(from.zoom)
    expect(result.zoom).toBeLessThan(to.zoom)
    expect(result.panX).toBeGreaterThan(from.panX)
    expect(result.panX).toBeLessThan(to.panX)
    expect(result.panY).toBeGreaterThan(from.panY)
    expect(result.panY).toBeLessThan(to.panY)
  })
})

describe("constants", () => {
  it("STEP_ZOOM_DURATION is 500", () => {
    expect(STEP_ZOOM_DURATION).toBe(500)
  })
})
