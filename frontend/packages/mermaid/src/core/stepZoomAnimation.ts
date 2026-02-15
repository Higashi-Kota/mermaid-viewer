import type { TransformState } from "../types"
import type { StepInfo } from "./StepZoomManager"

/**
 * easeInOutCubic イージング関数
 * 滑らかな加減速でアニメーション遷移を実現
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

/** ステップズームアニメーションのデフォルト時間 (ms) */
export const STEP_ZOOM_DURATION = 500

/** ノードフォーカス時のパディング倍率 */
const PADDING_RATIO = 0.15

/** ノードフォーカス時のスケール緩和係数 */
const SCALE_RELAXATION = 0.85

/** ノードフォーカス時のズーム下限 */
const MIN_FOCUS_ZOOM = 0.5

/** ノードフォーカス時のズーム上限 */
const MAX_FOCUS_ZOOM = 4.0

/**
 * ノードの BBox からターゲット TransformState を計算
 *
 * ノードをビューポート中央にパディング付きで配置する。
 * SVG viewBox のオリジン (minX, minY) は CSS transform の wrapper div 座標系で考慮される。
 *
 * @param nodeBBox - ノードのバウンディングボックス（SVG 内部座標）
 * @param viewportWidth - ビューポート幅 (px)
 * @param viewportHeight - ビューポート高さ (px)
 */
export function calculateStepZoomTarget(
  nodeBBox: StepInfo["bbox"],
  viewportWidth: number,
  viewportHeight: number,
): TransformState {
  // パディング付きの領域を計算
  const padding = Math.max(nodeBBox.width, nodeBBox.height) * PADDING_RATIO
  const paddedWidth = nodeBBox.width + padding * 2
  const paddedHeight = nodeBBox.height + padding * 2

  // ビューポートに収まるスケールを計算
  const canvasRatio = viewportWidth / viewportHeight
  const nodeRatio = paddedWidth / paddedHeight

  let zoom: number
  if (nodeRatio > canvasRatio) {
    // ノードがビューポートより横長 → 幅に合わせる
    zoom = (viewportWidth / paddedWidth) * SCALE_RELAXATION
  } else {
    // ノードがビューポートより縦長 → 高さに合わせる
    zoom = (viewportHeight / paddedHeight) * SCALE_RELAXATION
  }

  // ズーム倍率を制限
  zoom = Math.max(MIN_FOCUS_ZOOM, Math.min(MAX_FOCUS_ZOOM, zoom))

  // ノード中心をビューポート中央に配置
  const nodeCenterX = nodeBBox.x + nodeBBox.width / 2
  const nodeCenterY = nodeBBox.y + nodeBBox.height / 2

  const panX = viewportWidth / 2 - nodeCenterX * zoom
  const panY = viewportHeight / 2 - nodeCenterY * zoom

  return { zoom, panX, panY }
}

/**
 * 2つの TransformState を補間
 *
 * @param from - 開始状態
 * @param to - 終了状態
 * @param progress - 進捗 (0-1)、easeInOutCubic 適用前のリニア値
 */
export function interpolateTransform(
  from: TransformState,
  to: TransformState,
  progress: number,
): TransformState {
  const t = easeInOutCubic(progress)
  return {
    zoom: from.zoom + (to.zoom - from.zoom) * t,
    panX: from.panX + (to.panX - from.panX) * t,
    panY: from.panY + (to.panY - from.panY) * t,
  }
}
