import type { PinchGestureState, TouchPoint, TransformState, ZoomConstraints } from "../types"
import { clampZoom } from "./transform"

/**
 * Calculate distance between two touch points
 */
export function distance(p1: TouchPoint, p2: TouchPoint): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

/**
 * Calculate center point between two touch points
 */
export function center(p1: TouchPoint, p2: TouchPoint): { readonly x: number; readonly y: number } {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  }
}

/**
 * Convert TouchList to TouchPoint array with container-relative coordinates
 */
export function touchListToPoints(touches: TouchList, rect: DOMRect): TouchPoint[] {
  return Array.from(touches).map((t) => ({
    identifier: t.identifier,
    x: t.clientX - rect.left,
    y: t.clientY - rect.top,
  }))
}

/**
 * Calculate new transform from pinch gesture using delta-based approach
 *
 * Algorithm:
 * 1. Calculate scale difference from previous frame (not initial)
 * 2. Calculate center point movement delta
 * 3. Apply scale around previous center point
 * 4. Add center movement as pan offset
 *
 * This ensures accurate tracking even when pinch center moves during gesture.
 */
export function calculatePinchZoom(
  gesture: Extract<PinchGestureState, { type: "pinch" }>,
  newTouches: readonly [TouchPoint, TouchPoint],
  currentTransform: TransformState,
  constraints: ZoomConstraints,
): {
  readonly transform: TransformState
  readonly newCenter: { readonly x: number; readonly y: number }
  readonly newDistance: number
} {
  const newDistance = distance(newTouches[0], newTouches[1])
  const newCenter = center(newTouches[0], newTouches[1])

  // Delta calculation (compared to previous frame)
  const scaleDiff = newDistance / gesture.prevDistance
  const centerDx = newCenter.x - gesture.prevCenter.x
  const centerDy = newCenter.y - gesture.prevCenter.y

  // Calculate new zoom level with constraints
  const newZoom = clampZoom(currentTransform.zoom * scaleDiff, constraints)
  const actualScaleDiff = newZoom / currentTransform.zoom

  // Apply scale around previous center point, then add center movement
  // Formula: newPan = pivotPoint - (pivotPoint - currentPan) * scaleDiff + centerDelta
  const newPanX =
    gesture.prevCenter.x -
    (gesture.prevCenter.x - currentTransform.panX) * actualScaleDiff +
    centerDx
  const newPanY =
    gesture.prevCenter.y -
    (gesture.prevCenter.y - currentTransform.panY) * actualScaleDiff +
    centerDy

  return {
    transform: { zoom: newZoom, panX: newPanX, panY: newPanY },
    newCenter,
    newDistance,
  }
}

/**
 * Initial idle state
 */
export const IDLE_PINCH_STATE: PinchGestureState = { type: "idle" }
