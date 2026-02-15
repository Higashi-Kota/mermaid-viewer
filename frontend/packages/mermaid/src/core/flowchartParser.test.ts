// @vitest-environment jsdom
import mermaid from "mermaid"
import { beforeAll, describe, expect, it } from "vitest"

import { isFlowchartDefinition, parseFlowchart } from "./flowchartParser"

beforeAll(() => {
  mermaid.initialize({ startOnLoad: false })
})

// ========================================
// 4.1 isFlowchartDefinition (sync, 10 cases)
// ========================================
describe("isFlowchartDefinition", () => {
  it('returns true for "flowchart TD"', () => {
    expect(isFlowchartDefinition("flowchart TD")).toBe(true)
  })

  it('returns true for "flowchart LR"', () => {
    expect(isFlowchartDefinition("flowchart LR")).toBe(true)
  })

  it('returns true for "graph TD"', () => {
    expect(isFlowchartDefinition("graph TD")).toBe(true)
  })

  it('returns true for "graph LR"', () => {
    expect(isFlowchartDefinition("graph LR")).toBe(true)
  })

  it("returns true with leading whitespace", () => {
    expect(isFlowchartDefinition("  flowchart TD")).toBe(true)
  })

  it('returns false for "sequenceDiagram"', () => {
    expect(isFlowchartDefinition("sequenceDiagram")).toBe(false)
  })

  it('returns false for "classDiagram"', () => {
    expect(isFlowchartDefinition("classDiagram")).toBe(false)
  })

  it("returns false for empty string", () => {
    expect(isFlowchartDefinition("")).toBe(false)
  })

  it('returns false for "Flowchart" (case sensitive)', () => {
    expect(isFlowchartDefinition("Flowchart TD")).toBe(false)
  })

  it('returns false for "pie"', () => {
    expect(isFlowchartDefinition("pie")).toBe(false)
  })
})

// ========================================
// 4.2 parseFlowchart (async, 10 cases)
// ========================================
describe("parseFlowchart", () => {
  it("returns empty result for non-flowchart definition", async () => {
    const result = await parseFlowchart("sequenceDiagram\n  Alice->>Bob: Hi")
    expect(result.nodeIds).toHaveLength(0)
    expect(result.nodeLabels.size).toBe(0)
  })

  it("returns empty result for empty string", async () => {
    const result = await parseFlowchart("")
    expect(result.nodeIds).toHaveLength(0)
    expect(result.nodeLabels.size).toBe(0)
  })

  it("parses simple flowchart with node IDs", async () => {
    const result = await parseFlowchart("flowchart TD\n  A --> B")
    expect(result.nodeIds).toContain("A")
    expect(result.nodeIds).toContain("B")
    expect(result.nodeIds.length).toBeGreaterThanOrEqual(2)
  })

  it("parses node labels correctly", async () => {
    const result = await parseFlowchart("flowchart TD\n  A[Start] --> B[End]")
    expect(result.nodeLabels.get("A")).toBe("Start")
    expect(result.nodeLabels.get("B")).toBe("End")
  })

  it("does not include label when text equals id", async () => {
    // When no label is provided, mermaid sets text = id
    const result = await parseFlowchart("flowchart TD\n  A --> B")
    // Neither A nor B should have labels since text === id
    expect(result.nodeLabels.has("A")).toBe(false)
    expect(result.nodeLabels.has("B")).toBe(false)
  })

  it("returns empty result on parse error", async () => {
    const result = await parseFlowchart("flowchart TD\n  >>>invalid<<<")
    expect(result.nodeIds).toHaveLength(0)
    expect(result.nodeLabels.size).toBe(0)
  })

  it("empty result nodeIds is frozen", async () => {
    const result = await parseFlowchart("sequenceDiagram")
    expect(Object.isFrozen(result.nodeIds)).toBe(true)
  })

  it("empty result nodeLabels is an empty Map", async () => {
    const result = await parseFlowchart("sequenceDiagram")
    expect(result.nodeLabels).toBeInstanceOf(Map)
    expect(result.nodeLabels.size).toBe(0)
  })

  it("subgraph titles are not misidentified as nodes", async () => {
    const def = `flowchart TD
  subgraph MyGroup [Group Title]
    A[Node A] --> B[Node B]
  end`
    const result = await parseFlowchart(def)
    // Should contain A and B as nodes
    expect(result.nodeIds).toContain("A")
    expect(result.nodeIds).toContain("B")
    // MyGroup may appear as a node (mermaid treats subgraphs as vertices in some versions)
    // but "Group Title" should only be a label, not a separate node
    expect(result.nodeIds).not.toContain("Group Title")
  })

  it("parses flowchart with multiple edges", async () => {
    const result = await parseFlowchart("flowchart TD\n  A --> B --> C")
    expect(result.nodeIds).toContain("A")
    expect(result.nodeIds).toContain("B")
    expect(result.nodeIds).toContain("C")
  })
})
