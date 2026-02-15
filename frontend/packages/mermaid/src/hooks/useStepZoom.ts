import { useEffect, useRef, useState } from "react"

import { isFlowchartDefinition, parseFlowchart } from "../core/flowchartParser"
import type { StepInfo } from "../core/StepZoomManager"
import {
  calculateStepZoomTarget,
  interpolateTransform,
  STEP_ZOOM_DURATION,
} from "../core/stepZoomAnimation"
import type { MermaidStore } from "../store/MermaidStore"

/**
 * Mermaid SVG DOM からフローチャートノードの ID マッピングを取得
 *
 * Mermaid flowchart は各ノードに id="flowchart-{nodeId}-{counter}" を付与する。
 * この関数は SVG 内の全ノード要素を検出し、ソース ID → DOM ID のマッピングを返す。
 */
function extractNodeDomMap(
  svgWrapper: HTMLDivElement,
): Map<string, { domId: string; element: SVGGElement }> {
  const map = new Map<string, { domId: string; element: SVGGElement }>()
  const svgEl = svgWrapper.querySelector("svg")
  if (!svgEl) return map

  const nodeElements = svgEl.querySelectorAll<SVGGElement>('g[id^="flowchart-"]')
  for (const el of nodeElements) {
    const domId = el.id
    // domId format: "flowchart-{nodeId}-{counter}"
    // Extract nodeId by removing prefix "flowchart-" and suffix "-{counter}"
    const withoutPrefix = domId.replace(/^flowchart-/, "")
    const lastDash = withoutPrefix.lastIndexOf("-")
    if (lastDash > 0) {
      const nodeId = withoutPrefix.substring(0, lastDash)
      // 最初に見つかったものを優先（重複 ID がある場合）
      if (!map.has(nodeId)) {
        map.set(nodeId, { domId, element: el })
      }
    }
  }

  return map
}

/**
 * SVG 要素のバウンディングボックスを SVG 座標空間で取得
 *
 * getBBox() はローカル座標を返すため、要素の transform（translate 等）が
 * 反映されない。getCTM() を使ってローカル座標を SVG ビューポート座標に変換する。
 */
function getElementBBox(element: SVGGElement): StepInfo["bbox"] {
  const bbox = element.getBBox()
  const svg = element.ownerSVGElement
  if (!svg) {
    return { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height }
  }

  const ctm = element.getCTM()
  const svgCtm = svg.getCTM()
  if (!ctm || !svgCtm) {
    return { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height }
  }

  // 要素ローカル座標 → SVG ビューポート座標への変換行列
  const matrix = svgCtm.inverse().multiply(ctm)

  // バウンディングボックスの四隅を変換して新しい AABB を求める
  const corners = [
    new DOMPoint(bbox.x, bbox.y),
    new DOMPoint(bbox.x + bbox.width, bbox.y),
    new DOMPoint(bbox.x, bbox.y + bbox.height),
    new DOMPoint(bbox.x + bbox.width, bbox.y + bbox.height),
  ]
  const transformed = corners.map((p) => p.matrixTransform(matrix))

  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  for (const p of transformed) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

/**
 * prefers-reduced-motion をチェック
 */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

interface UseStepZoomReturn {
  /** ステップズームモードを開始 */
  readonly enterStepZoom: (startIndex?: number) => void
  /** ステップズームモードを終了 */
  readonly exitStepZoom: () => void
  /** 次のステップへ */
  readonly nextStep: () => void
  /** 前のステップへ */
  readonly previousStep: () => void
  /** 指定ステップへ移動（非アクティブ時は自動開始） */
  readonly goToStep: (index: number) => void
  /** 進行中のアニメーションをキャンセル */
  readonly cancelAnimation: () => void
  /** flowchart 定義かどうか */
  readonly isFlowchart: boolean
  /** パース済みノード ID 配列（初出順） */
  readonly nodeIds: readonly string[]
  /** ノード ID → ラベルのマッピング */
  readonly nodeLabels: ReadonlyMap<string, string>
}

/**
 * useStepZoom - ステップズーム機能を提供するカスタムフック
 *
 * mermaid の AST パーサーでノード情報を抽出し、
 * SVG DOM からノード要素を検出して構文記述順に巡回するステップズームを実現する。
 * アニメーションは requestAnimationFrame + easeInOutCubic で実装。
 */
export function useStepZoom(
  store: MermaidStore,
  svgWrapperRef: React.RefObject<HTMLDivElement | null>,
  definition: string,
): UseStepZoomReturn {
  const animationRef = useRef<number | null>(null)
  const nodeIdsRef = useRef<readonly string[]>([])
  const nodeLabelsRef = useRef<ReadonlyMap<string, string>>(new Map())
  const isFlowchart = isFlowchartDefinition(definition)

  // definition 変更時に AST パースを実行（外部ライブラリとの同期 = useEffect 適合）
  const [, setParseVersion] = useState(0)

  useEffect(() => {
    if (!isFlowchart) {
      nodeIdsRef.current = []
      nodeLabelsRef.current = new Map()
      setParseVersion((v) => v + 1)
      return
    }

    let cancelled = false
    parseFlowchart(definition).then((result) => {
      if (cancelled) return
      nodeIdsRef.current = result.nodeIds
      nodeLabelsRef.current = result.nodeLabels
      setParseVersion((v) => v + 1)
    })

    return () => {
      cancelled = true
    }
  }, [definition, isFlowchart])

  // アンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [])

  // アニメーションのキャンセル
  function cancelAnimation() {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }

  // ノードへのアニメーションズーム
  function animateToStep(step: StepInfo) {
    cancelAnimation()

    const snapshot = store.getSnapshot()
    const { width, height } = snapshot.panZoom.viewportSize
    if (width <= 0 || height <= 0) return

    const target = calculateStepZoomTarget(step.bbox, width, height)

    // prefers-reduced-motion の場合は即座に遷移
    if (prefersReducedMotion()) {
      store.setTransform(target)
      return
    }

    const from = snapshot.transformState
    const startTime = performance.now()

    function frame(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / STEP_ZOOM_DURATION, 1)
      const current = interpolateTransform(from, target, progress)
      store.setTransform(current)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(frame)
      } else {
        // 最終値を正確に設定
        store.setTransform(target)
        animationRef.current = null
      }
    }

    animationRef.current = requestAnimationFrame(frame)
  }

  // ステップズーム開始
  function enterStepZoom(startIndex = 0) {
    if (!svgWrapperRef.current || !isFlowchart) return

    // パース済みデータを使用
    const nodeOrder = nodeIdsRef.current
    if (nodeOrder.length === 0) return

    // SVG DOM からノード要素を検出
    const domMap = extractNodeDomMap(svgWrapperRef.current)

    // テキスト順序に基づいてステップ情報を構築
    const steps: StepInfo[] = []
    for (const nodeId of nodeOrder) {
      const entry = domMap.get(nodeId)
      if (entry) {
        steps.push({
          nodeId,
          domId: entry.domId,
          bbox: getElementBBox(entry.element),
        })
      }
    }

    if (steps.length === 0) return

    // ストアにステップズーム状態を設定
    store.enterStepZoom(steps)

    // 開始ステップへ移動してアニメーション
    if (startIndex > 0) {
      store.goToStep(startIndex)
    }
    const updatedSnapshot = store.getSnapshot()
    const step = updatedSnapshot.stepZoom.currentStep
    if (step) {
      animateToStep(step)
    }
  }

  // ステップズーム終了
  function exitStepZoom() {
    cancelAnimation()
    store.exitStepZoom()
  }

  // 次のステップ
  function nextStep() {
    const snapshot = store.getSnapshot()
    if (!snapshot.stepZoom.isActive) return

    store.nextStep()
    const updatedSnapshot = store.getSnapshot()
    const step = updatedSnapshot.stepZoom.currentStep
    if (step) {
      animateToStep(step)
    }
  }

  // 前のステップ
  function previousStep() {
    const snapshot = store.getSnapshot()
    if (!snapshot.stepZoom.isActive) return

    store.previousStep()
    const updatedSnapshot = store.getSnapshot()
    const step = updatedSnapshot.stepZoom.currentStep
    if (step) {
      animateToStep(step)
    }
  }

  // 指定ステップへ移動（非アクティブ時は自動開始）
  function goToStep(index: number) {
    const snapshot = store.getSnapshot()
    if (!snapshot.stepZoom.isActive) {
      enterStepZoom(index)
      return
    }
    store.goToStep(index)
    const updatedSnapshot = store.getSnapshot()
    const step = updatedSnapshot.stepZoom.currentStep
    if (step) {
      animateToStep(step)
    }
  }

  return {
    enterStepZoom,
    exitStepZoom,
    nextStep,
    previousStep,
    goToStep,
    cancelAnimation,
    isFlowchart,
    nodeIds: nodeIdsRef.current,
    nodeLabels: nodeLabelsRef.current,
  }
}
