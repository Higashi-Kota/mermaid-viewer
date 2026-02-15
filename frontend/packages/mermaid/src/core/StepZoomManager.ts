/**
 * ステップズーム用のノード情報
 */
export interface StepInfo {
  /** mermaid ソースの ID (例: "A") */
  readonly nodeId: string
  /** SVG 要素 ID (例: "flowchart-A-0") */
  readonly domId: string
  /** SVG 座標系でのバウンディングボックス */
  readonly bbox: {
    readonly x: number
    readonly y: number
    readonly width: number
    readonly height: number
  }
}

/**
 * ステップズーム状態
 */
interface StepZoomState {
  readonly mode: "inactive" | "active"
  readonly currentIndex: number
  readonly steps: readonly StepInfo[]
}

const INACTIVE_STATE: StepZoomState = {
  mode: "inactive",
  currentIndex: 0,
  steps: [],
}

/**
 * StepZoomManager - イミュータブルなステップズーム状態管理クラス
 *
 * Flowchart のノードを構文記述順に巡回するステップズーム機能の状態を管理する。
 * 全てのメソッドは新しいインスタンスを返し、元のインスタンスは変更しない。
 */
export class StepZoomManager {
  private constructor(private readonly _state: StepZoomState) {}

  /**
   * 非アクティブ状態を作成
   */
  static inactive(): StepZoomManager {
    return new StepZoomManager(INACTIVE_STATE)
  }

  /**
   * ステップ情報からアクティブ状態を作成（index=0 から開始）
   */
  static create(steps: readonly StepInfo[]): StepZoomManager {
    if (steps.length === 0) {
      return StepZoomManager.inactive()
    }
    return new StepZoomManager({
      mode: "active",
      currentIndex: 0,
      steps,
    })
  }

  // ========================================
  // Getters
  // ========================================

  get isActive(): boolean {
    return this._state.mode === "active"
  }

  get currentIndex(): number {
    return this._state.currentIndex
  }

  get totalSteps(): number {
    return this._state.steps.length
  }

  get currentStep(): StepInfo | null {
    if (!this.isActive || this._state.steps.length === 0) {
      return null
    }
    return this._state.steps[this._state.currentIndex] ?? null
  }

  get steps(): readonly StepInfo[] {
    return this._state.steps
  }

  // ========================================
  // Navigation
  // ========================================

  /**
   * 次のステップへ移動（末尾でクランプ）
   */
  next(): StepZoomManager {
    if (!this.isActive) return this
    const nextIndex = Math.min(this._state.currentIndex + 1, this._state.steps.length - 1)
    if (nextIndex === this._state.currentIndex) return this
    return new StepZoomManager({
      ...this._state,
      currentIndex: nextIndex,
    })
  }

  /**
   * 前のステップへ移動（先頭でクランプ）
   */
  previous(): StepZoomManager {
    if (!this.isActive) return this
    const prevIndex = Math.max(this._state.currentIndex - 1, 0)
    if (prevIndex === this._state.currentIndex) return this
    return new StepZoomManager({
      ...this._state,
      currentIndex: prevIndex,
    })
  }

  /**
   * 指定インデックスのステップへ移動
   */
  goToStep(index: number): StepZoomManager {
    if (!this.isActive) return this
    const clampedIndex = Math.max(0, Math.min(index, this._state.steps.length - 1))
    if (clampedIndex === this._state.currentIndex) return this
    return new StepZoomManager({
      ...this._state,
      currentIndex: clampedIndex,
    })
  }

  /**
   * ステップズームを非アクティブにする
   */
  deactivate(): StepZoomManager {
    if (!this.isActive) return this
    return StepZoomManager.inactive()
  }
}
