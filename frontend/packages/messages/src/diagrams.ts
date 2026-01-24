import type { Language } from "@mermaid-demo/i18n"

export const diagramMessages = {
  // Flowcharts
  "diagram.largeFlowchart.name": { ja: "大規模フローチャート", en: "Large Flowchart" },
  "diagram.largeFlowchart.description": {
    ja: "幅広で高い図 - パン/ズーム制限のテスト",
    en: "Wide and tall diagram - tests pan/zoom limits",
  },
  "diagram.smallDiagram.name": { ja: "小さい図", en: "Small Diagram" },
  "diagram.smallDiagram.description": {
    ja: "最小限の図 - ビューポートへのフィットのテスト",
    en: "Minimal diagram - tests fit-to-viewport",
  },
  "diagram.wideDiagram.name": { ja: "横長の図", en: "Wide Diagram" },
  "diagram.wideDiagram.description": {
    ja: "横方向レイアウト - 水平スクロールのテスト",
    en: "Horizontal layout - tests horizontal scrolling",
  },
  "diagram.tallDiagram.name": { ja: "縦長の図", en: "Tall Diagram" },
  "diagram.tallDiagram.description": {
    ja: "縦方向レイアウト - 垂直スクロールのテスト",
    en: "Vertical layout - tests vertical scrolling",
  },

  // UML Diagrams
  "diagram.sequenceDiagram.name": { ja: "シーケンス図", en: "Sequence Diagram" },
  "diagram.sequenceDiagram.description": {
    ja: "異なる図タイプ - シーケンスレンダリングのテスト",
    en: "Different diagram type - tests sequence rendering",
  },
  "diagram.classDiagram.name": { ja: "クラス図", en: "Class Diagram" },
  "diagram.classDiagram.description": {
    ja: "UMLクラス図 - 複雑な形状のテスト",
    en: "UML class diagram - tests complex shapes",
  },
  "diagram.stateDiagram.name": { ja: "状態遷移図", en: "State Diagram" },
  "diagram.stateDiagram.description": {
    ja: "状態マシン - 状態遷移のテスト",
    en: "State machine - tests state transitions",
  },
  "diagram.erDiagram.name": { ja: "ER図", en: "ER Diagram" },
  "diagram.erDiagram.description": {
    ja: "エンティティ関係 - データベーススキーマレンダリングのテスト",
    en: "Entity relationship - tests database schema rendering",
  },

  // Project Management
  "diagram.ganttChart.name": { ja: "ガントチャート", en: "Gantt Chart" },
  "diagram.ganttChart.description": {
    ja: "プロジェクトスケジュール - タイムラインレンダリングのテスト",
    en: "Project schedule - tests timeline rendering",
  },
  "diagram.userJourney.name": { ja: "ユーザージャーニー", en: "User Journey" },
  "diagram.userJourney.description": {
    ja: "ユーザー体験フロー - ジャーニーレンダリングのテスト",
    en: "User experience flow - tests journey rendering",
  },

  // Charts
  "diagram.pieChart.name": { ja: "円グラフ", en: "Pie Chart" },
  "diagram.pieChart.description": {
    ja: "データ分布 - 円グラフレンダリングのテスト",
    en: "Data distribution - tests pie rendering",
  },
  "diagram.quadrantChart.name": { ja: "四象限チャート", en: "Quadrant Chart" },
  "diagram.quadrantChart.description": {
    ja: "優先度マトリックス - 四象限レンダリングのテスト",
    en: "Priority matrix - tests quadrant rendering",
  },
  "diagram.xyChart.name": { ja: "XYチャート", en: "XY Chart" },
  "diagram.xyChart.description": {
    ja: "折れ線/棒グラフ - XYチャートレンダリングのテスト",
    en: "Line/bar chart - tests xychart rendering",
  },
  "diagram.sankeyDiagram.name": { ja: "サンキー図", en: "Sankey Diagram" },
  "diagram.sankeyDiagram.description": {
    ja: "フロー可視化 - サンキーレンダリングのテスト",
    en: "Flow visualization - tests sankey rendering",
  },

  // Development
  "diagram.gitGraph.name": { ja: "Gitグラフ", en: "Git Graph" },
  "diagram.gitGraph.description": {
    ja: "Gitブランチ履歴 - Gitグラフレンダリングのテスト",
    en: "Git branch history - tests git graph rendering",
  },
  "diagram.requirementsDiagram.name": { ja: "要件図", en: "Requirements" },
  "diagram.requirementsDiagram.description": {
    ja: "システム要件 - 要件レンダリングのテスト",
    en: "System requirements - tests requirement rendering",
  },
  "diagram.c4Diagram.name": { ja: "C4図", en: "C4 Diagram" },
  "diagram.c4Diagram.description": {
    ja: "ソフトウェアアーキテクチャ - C4レンダリングのテスト",
    en: "Software architecture - tests C4 rendering",
  },

  // Other
  "diagram.mindmap.name": { ja: "マインドマップ", en: "Mind Map" },
  "diagram.mindmap.description": {
    ja: "アイデア整理 - マインドマップレンダリングのテスト",
    en: "Idea organization - tests mindmap rendering",
  },
  "diagram.timeline.name": { ja: "タイムライン", en: "Timeline" },
  "diagram.timeline.description": {
    ja: "時系列イベント - タイムラインレンダリングのテスト",
    en: "Chronological events - tests timeline rendering",
  },
} as const satisfies Record<string, Record<Language, string>>
