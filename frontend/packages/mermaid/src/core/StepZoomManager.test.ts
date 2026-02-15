import { describe, expect, it } from "vitest"

import type { StepInfo } from "./StepZoomManager"
import { StepZoomManager } from "./StepZoomManager"

function makeSteps(count: number): StepInfo[] {
  return Array.from({ length: count }, (_, i) => ({
    nodeId: `N${i}`,
    domId: `flowchart-N${i}-0`,
    bbox: { x: i * 100, y: 0, width: 80, height: 40 },
  }))
}

describe("StepZoomManager", () => {
  // ========================================
  // 2.1 ファクトリメソッド (5 cases)
  // ========================================
  describe("factory methods", () => {
    it("inactive() returns an inactive manager", () => {
      const manager = StepZoomManager.inactive()
      expect(manager.isActive).toBe(false)
      expect(manager.currentIndex).toBe(0)
      expect(manager.totalSteps).toBe(0)
      expect(manager.currentStep).toBeNull()
      expect(manager.steps).toHaveLength(0)
    })

    it("create(steps) returns an active manager at index 0", () => {
      const steps = makeSteps(3)
      const manager = StepZoomManager.create(steps)
      expect(manager.isActive).toBe(true)
      expect(manager.currentIndex).toBe(0)
      expect(manager.totalSteps).toBe(3)
      expect(manager.currentStep).toBe(steps[0])
    })

    it("create([]) returns an inactive manager (empty guard)", () => {
      const manager = StepZoomManager.create([])
      expect(manager.isActive).toBe(false)
      expect(manager.currentIndex).toBe(0)
      expect(manager.totalSteps).toBe(0)
      expect(manager.currentStep).toBeNull()
    })

    it("create(steps) preserves step references", () => {
      const steps = makeSteps(3)
      const manager = StepZoomManager.create(steps)
      expect(manager.steps).toBe(steps)
    })

    it("two inactive() calls return distinct instances", () => {
      const a = StepZoomManager.inactive()
      const b = StepZoomManager.inactive()
      expect(a).not.toBe(b)
    })
  })

  // ========================================
  // 2.2 ナビゲーション正常系 (8 cases)
  // ========================================
  describe("navigation - happy path", () => {
    it("next() advances index by 1", () => {
      const manager = StepZoomManager.create(makeSteps(5))
      const result = manager.next()
      expect(result.currentIndex).toBe(1)
      expect(result.currentStep).toEqual(makeSteps(5)[1])
    })

    it("next() returns a new instance", () => {
      const manager = StepZoomManager.create(makeSteps(5))
      const result = manager.next()
      expect(result).not.toBe(manager)
    })

    it("previous() decrements index by 1", () => {
      const manager = StepZoomManager.create(makeSteps(5)).next().next()
      const result = manager.previous()
      expect(result.currentIndex).toBe(1)
    })

    it("previous() returns a new instance", () => {
      const manager = StepZoomManager.create(makeSteps(5)).next()
      const result = manager.previous()
      expect(result).not.toBe(manager)
    })

    it("goToStep(n) jumps to the correct index", () => {
      const manager = StepZoomManager.create(makeSteps(5))
      const result = manager.goToStep(3)
      expect(result.currentIndex).toBe(3)
    })

    it("goToStep(n) returns a new instance", () => {
      const manager = StepZoomManager.create(makeSteps(5))
      const result = manager.goToStep(3)
      expect(result).not.toBe(manager)
    })

    it("sequential next() traverses all steps", () => {
      let manager = StepZoomManager.create(makeSteps(4))
      for (let i = 1; i < 4; i++) {
        manager = manager.next()
        expect(manager.currentIndex).toBe(i)
      }
    })

    it("sequential previous() traverses back to 0", () => {
      let manager = StepZoomManager.create(makeSteps(4)).goToStep(3)
      for (let i = 2; i >= 0; i--) {
        manager = manager.previous()
        expect(manager.currentIndex).toBe(i)
      }
    })
  })

  // ========================================
  // 2.3 ガード条件（this を返す）(7 cases)
  // ========================================
  describe("guard conditions (return this)", () => {
    it("next() returns this when inactive", () => {
      const inactive = StepZoomManager.inactive()
      expect(inactive.next()).toBe(inactive)
    })

    it("next() returns this when at last step", () => {
      const manager = StepZoomManager.create(makeSteps(3)).goToStep(2)
      expect(manager.next()).toBe(manager)
    })

    it("previous() returns this when inactive", () => {
      const inactive = StepZoomManager.inactive()
      expect(inactive.previous()).toBe(inactive)
    })

    it("previous() returns this when at first step (index 0)", () => {
      const manager = StepZoomManager.create(makeSteps(3))
      expect(manager.previous()).toBe(manager)
    })

    it("goToStep() returns this when inactive", () => {
      const inactive = StepZoomManager.inactive()
      expect(inactive.goToStep(1)).toBe(inactive)
    })

    it("goToStep() returns this when index equals current", () => {
      const manager = StepZoomManager.create(makeSteps(3))
      expect(manager.goToStep(0)).toBe(manager)
    })

    it("deactivate() returns this when already inactive", () => {
      const inactive = StepZoomManager.inactive()
      expect(inactive.deactivate()).toBe(inactive)
    })
  })

  // ========================================
  // 2.4 クランプ (3 cases)
  // ========================================
  describe("clamping", () => {
    it("goToStep(-1) clamps to 0", () => {
      const manager = StepZoomManager.create(makeSteps(3)).goToStep(1)
      const result = manager.goToStep(-1)
      expect(result.currentIndex).toBe(0)
    })

    it("goToStep(999) clamps to last index", () => {
      const manager = StepZoomManager.create(makeSteps(3))
      const result = manager.goToStep(999)
      expect(result.currentIndex).toBe(2)
    })

    it("goToStep(-100) clamps to 0", () => {
      const manager = StepZoomManager.create(makeSteps(3)).goToStep(1)
      const result = manager.goToStep(-100)
      expect(result.currentIndex).toBe(0)
    })
  })

  // ========================================
  // 2.5 非アクティブ化 (2 cases)
  // ========================================
  describe("deactivation", () => {
    it("deactivate() on active returns inactive", () => {
      const manager = StepZoomManager.create(makeSteps(3))
      const result = manager.deactivate()
      expect(result.isActive).toBe(false)
      expect(result.totalSteps).toBe(0)
      expect(result.currentStep).toBeNull()
    })

    it("deactivate() returns a new instance", () => {
      const manager = StepZoomManager.create(makeSteps(3))
      const result = manager.deactivate()
      expect(result).not.toBe(manager)
    })
  })

  // ========================================
  // 2.6 イミュータビリティ検証 (3 cases)
  // ========================================
  describe("immutability", () => {
    it("next() does not mutate the original instance", () => {
      const manager = StepZoomManager.create(makeSteps(5))
      manager.next()
      expect(manager.currentIndex).toBe(0)
    })

    it("goToStep() does not mutate the original instance", () => {
      const manager = StepZoomManager.create(makeSteps(5))
      manager.goToStep(3)
      expect(manager.currentIndex).toBe(0)
    })

    it("deactivate() does not mutate the original instance", () => {
      const manager = StepZoomManager.create(makeSteps(5))
      manager.deactivate()
      expect(manager.isActive).toBe(true)
      expect(manager.currentIndex).toBe(0)
    })
  })

  // ========================================
  // 2.7 エッジケース (4 cases)
  // ========================================
  describe("edge cases", () => {
    it("single step: next() returns this", () => {
      const manager = StepZoomManager.create(makeSteps(1))
      expect(manager.next()).toBe(manager)
    })

    it("single step: previous() returns this", () => {
      const manager = StepZoomManager.create(makeSteps(1))
      expect(manager.previous()).toBe(manager)
    })

    it("single step: goToStep(0) returns this", () => {
      const manager = StepZoomManager.create(makeSteps(1))
      expect(manager.goToStep(0)).toBe(manager)
    })

    it("currentStep is correct after multiple navigations", () => {
      const steps = makeSteps(5)
      const result = StepZoomManager.create(steps).next().next().previous()
      expect(result.currentIndex).toBe(1)
      expect(result.currentStep).toEqual(steps[1])
    })
  })
})
