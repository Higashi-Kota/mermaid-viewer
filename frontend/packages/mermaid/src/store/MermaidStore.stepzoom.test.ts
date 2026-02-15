import { describe, expect, it, vi } from "vitest"

import type { StepInfo } from "../core/StepZoomManager"
import { MermaidStore } from "./MermaidStore"

function makeSteps(count: number): StepInfo[] {
  return Array.from({ length: count }, (_, i) => ({
    nodeId: `N${i}`,
    domId: `flowchart-N${i}-0`,
    bbox: { x: i * 100, y: 0, width: 80, height: 40 },
  }))
}

describe("MermaidStore - step zoom integration", () => {
  it("initial state has inactive stepZoom", () => {
    const store = MermaidStore.create()
    expect(store.getSnapshot().stepZoom.isActive).toBe(false)
  })

  it("enterStepZoom activates stepZoom", () => {
    const store = MermaidStore.create()
    store.enterStepZoom(makeSteps(3))
    expect(store.getSnapshot().stepZoom.isActive).toBe(true)
    expect(store.getSnapshot().stepZoom.totalSteps).toBe(3)
  })

  it("enterStepZoom with empty steps remains inactive", () => {
    const store = MermaidStore.create()
    store.enterStepZoom([])
    // enterStepZoom always notifies (creates new manager), but result is inactive
    expect(store.getSnapshot().stepZoom.isActive).toBe(false)
  })

  it("exitStepZoom deactivates", () => {
    const store = MermaidStore.create()
    store.enterStepZoom(makeSteps(3))
    store.exitStepZoom()
    expect(store.getSnapshot().stepZoom.isActive).toBe(false)
  })

  it("exitStepZoom when already inactive does not notify", () => {
    const store = MermaidStore.create()
    const listener = vi.fn()
    store.subscribe(listener)
    store.exitStepZoom()
    expect(listener).not.toHaveBeenCalled()
  })

  it("nextStep advances index", () => {
    const store = MermaidStore.create()
    store.enterStepZoom(makeSteps(5))
    store.nextStep()
    expect(store.getSnapshot().stepZoom.currentIndex).toBe(1)
  })

  it("nextStep at boundary does not notify", () => {
    const store = MermaidStore.create()
    store.enterStepZoom(makeSteps(1))
    const listener = vi.fn()
    store.subscribe(listener)
    store.nextStep()
    expect(listener).not.toHaveBeenCalled()
  })

  it("previousStep decrements index", () => {
    const store = MermaidStore.create()
    store.enterStepZoom(makeSteps(5))
    store.nextStep()
    store.previousStep()
    expect(store.getSnapshot().stepZoom.currentIndex).toBe(0)
  })

  it("previousStep at boundary does not notify", () => {
    const store = MermaidStore.create()
    store.enterStepZoom(makeSteps(5))
    const listener = vi.fn()
    store.subscribe(listener)
    store.previousStep()
    expect(listener).not.toHaveBeenCalled()
  })

  it("goToStep jumps to index", () => {
    const store = MermaidStore.create()
    store.enterStepZoom(makeSteps(5))
    store.goToStep(3)
    expect(store.getSnapshot().stepZoom.currentIndex).toBe(3)
  })

  it("goToStep to same index does not notify", () => {
    const store = MermaidStore.create()
    store.enterStepZoom(makeSteps(5))
    const listener = vi.fn()
    store.subscribe(listener)
    store.goToStep(0)
    expect(listener).not.toHaveBeenCalled()
  })

  it("snapshot is cached until state changes", () => {
    const store = MermaidStore.create()
    const snap1 = store.getSnapshot()
    const snap2 = store.getSnapshot()
    expect(snap1).toBe(snap2)
  })

  it("snapshot is invalidated after enterStepZoom", () => {
    const store = MermaidStore.create()
    const snap1 = store.getSnapshot()
    store.enterStepZoom(makeSteps(3))
    const snap2 = store.getSnapshot()
    expect(snap1).not.toBe(snap2)
  })

  it("unsubscribe stops listener calls", () => {
    const store = MermaidStore.create()
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    unsubscribe()
    store.enterStepZoom(makeSteps(3))
    expect(listener).not.toHaveBeenCalled()
  })

  it("reset() deactivates stepZoom", () => {
    const store = MermaidStore.create()
    store.enterStepZoom(makeSteps(3))
    store.nextStep()
    store.reset()
    expect(store.getSnapshot().stepZoom.isActive).toBe(false)
  })
})
