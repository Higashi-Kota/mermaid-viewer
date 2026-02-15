import mermaid from "mermaid"

/**
 * Mermaid テキストが flowchart 定義かどうかを判定
 */
export function isFlowchartDefinition(definition: string): boolean {
  const trimmed = definition.trim()
  return trimmed.startsWith("flowchart") || trimmed.startsWith("graph")
}

/**
 * AST パースの結果
 */
export interface FlowchartParseResult {
  readonly nodeIds: readonly string[]
  readonly nodeLabels: ReadonlyMap<string, string>
}

/**
 * FlowDB の最小インターフェース
 *
 * mermaid 内部型（FlowVertex, FlowEdge, FlowDB）は公開 API に含まれないため、
 * 必要最小限のフィールドだけ定義する。
 */
interface FlowVertex {
  readonly id: string
  readonly text?: string
}

interface FlowEdge {
  readonly start: string
  readonly end: string
}

interface FlowDBLike {
  getVertices(): Map<string, FlowVertex>
  getEdges(): FlowEdge[]
}

/** Module-level frozen empty result (performance skill: module-level constants) */
const EMPTY_RESULT: FlowchartParseResult = Object.freeze({
  nodeIds: Object.freeze([] as string[]),
  nodeLabels: new Map<string, string>(),
})

/**
 * Mermaid flowchart テキストを AST ベースでパースし、ノード ID とラベルを抽出
 *
 * mermaid の JISON パーサー（FlowDB）を使用して正確な構文解析を行う。
 * 正規表現ベースのパースと異なり、subgraph タイトル・style ディレクティブ・
 * エッジラベルなどを誤抽出しない。
 *
 * @param definition - Mermaid flowchart 定義テキスト
 * @returns ノード ID 配列と ID → ラベルのマッピング
 */
export async function parseFlowchart(definition: string): Promise<FlowchartParseResult> {
  if (!isFlowchartDefinition(definition)) return EMPTY_RESULT

  try {
    const diagram = await mermaid.mermaidAPI.getDiagramFromText(definition)
    const db = diagram.db as FlowDBLike
    const vertices = db.getVertices()
    const edges = db.getEdges()

    // Build adjacency list and compute in-degree
    const adjacency = new Map<string, string[]>()
    const inDegree = new Map<string, number>()

    for (const id of vertices.keys()) {
      adjacency.set(id, [])
      inDegree.set(id, 0)
    }

    for (const edge of edges) {
      if (!adjacency.has(edge.start) || !vertices.has(edge.end)) continue
      adjacency.get(edge.start)?.push(edge.end)
      inDegree.set(edge.end, (inDegree.get(edge.end) ?? 0) + 1)
    }

    // Find root nodes (in-degree 0)
    const roots: string[] = []
    for (const [id, degree] of inDegree) {
      if (degree === 0) roots.push(id)
    }

    // Iterative DFS from each root
    const visited = new Set<string>()
    const nodeIds: string[] = []

    for (const root of roots) {
      if (visited.has(root)) continue
      const stack: string[] = [root]
      while (stack.length > 0) {
        const current = stack.pop()
        if (current === undefined || visited.has(current)) continue
        visited.add(current)
        nodeIds.push(current)

        const neighbors = adjacency.get(current) ?? []
        // Push in reverse so first neighbor is visited first
        for (let i = neighbors.length - 1; i >= 0; i--) {
          const neighbor = neighbors[i]
          if (neighbor !== undefined && !visited.has(neighbor)) {
            stack.push(neighbor)
          }
        }
      }
    }

    // Append unreachable nodes (e.g. in cycles with no root)
    for (const id of vertices.keys()) {
      if (!visited.has(id)) {
        nodeIds.push(id)
      }
    }

    // Build labels
    const nodeLabels = new Map<string, string>()
    for (const [id, vertex] of vertices) {
      if (vertex.text && vertex.text !== id) {
        nodeLabels.set(id, vertex.text)
      }
    }

    return { nodeIds, nodeLabels }
  } catch {
    return EMPTY_RESULT
  }
}
