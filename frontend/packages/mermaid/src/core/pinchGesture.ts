import type { PinchGestureState, TouchPoint, ZoomConstraints } from "../types"
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
 * Calculate zoom factor from pinch gesture
 */
export function calculatePinchZoom(
  gesture: Extract<PinchGestureState, { type: "pinch" }>,
  newTouches: readonly [TouchPoint, TouchPoint],
  constraints: ZoomConstraints,
): {
  readonly factor: number
  readonly newZoom: number
  readonly center: { readonly x: number; readonly y: number }
} {
  const newDistance = distance(newTouches[0], newTouches[1])
  const rawFactor = newDistance / gesture.initialDistance
  const rawZoom = gesture.initialZoom * rawFactor
  const newZoom = clampZoom(rawZoom, constraints)
  const newCenter = center(newTouches[0], newTouches[1])

  return {
    factor: newZoom / gesture.initialZoom,
    newZoom,
    center: newCenter,
  }
}

/**
 * Initial idle state
 */
export const IDLE_PINCH_STATE: PinchGestureState = { type: "idle" }
