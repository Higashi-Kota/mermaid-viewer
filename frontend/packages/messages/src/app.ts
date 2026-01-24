import type { Language } from "@mermaid-demo/i18n"

export const appMessages = {
  // Header
  "header.title": {
    ja: "ミニマップデモ - Mermaidビューワー",
    en: "Minimap Demo - Mermaid Viewer",
  },
  "header.subtitle": {
    ja: "図をタップして表示。ピンチまたはコントロールでズーム。ドラッグでパン。",
    en: "Tap a diagram to view it. Pinch or use controls to zoom. Drag to pan.",
  },

  // Sidebar
  "sidebar.storeState": { ja: "ストア状態", en: "Store State" },
  "sidebar.fullscreen": { ja: "フルスクリーン", en: "Fullscreen" },
  "sidebar.loading": { ja: "読み込み中", en: "Loading" },
  "sidebar.zoom": { ja: "ズーム", en: "Zoom" },
  "sidebar.pan": { ja: "パン", en: "Pan" },
  "sidebar.dimensions": { ja: "サイズ", en: "Dimensions" },

  // Instructions
  "instructions.title": { ja: "操作方法", en: "Instructions" },
  "instructions.pinchZoom": { ja: "ピンチまたはスクロールでズーム", en: "Pinch or scroll to zoom" },
  "instructions.dragPan": { ja: "ドラッグでパン", en: "Drag to pan the diagram" },
  "instructions.zoomControls": {
    ja: "下部のズームコントロールを使用",
    en: "Use zoom controls at bottom",
  },
  "instructions.minimapViewport": {
    ja: "ミニマップに現在のビューポートを表示",
    en: "Minimap shows current viewport",
  },
  "instructions.minimapNavigate": {
    ja: "ミニマップをタップしてナビゲート",
    en: "Tap minimap to navigate",
  },
  "instructions.fullscreenButton": {
    ja: "フルスクリーンボタンをタップして拡大",
    en: "Tap fullscreen button to expand",
  },
  "instructions.escapeClose": {
    ja: "Escapeキーでフルスクリーンを閉じる",
    en: "Press Escape to close fullscreen",
  },

  // Mobile drawer
  "drawer.selectDiagram": { ja: "図を選択", en: "Select Diagram" },
  "drawer.closeInfo": { ja: "情報パネルを閉じる", en: "Close info panel" },
  "drawer.closeDiagram": { ja: "図選択を閉じる", en: "Close diagram selector" },

  // Accessibility labels
  "aria.openInfo": { ja: "情報パネルを開く", en: "Open info panel" },
  "aria.selectDiagram": { ja: "図を選択", en: "Select diagram" },
  "aria.diagramSelection": { ja: "図の選択", en: "Diagram selection" },
  "aria.mobileNavigation": { ja: "モバイルナビゲーション", en: "Mobile navigation" },

  // Theme toggle
  "theme.toggle": { ja: "テーマ切替", en: "Toggle theme" },
  "theme.light": { ja: "ライトモードに切替", en: "Switch to light mode" },
  "theme.dark": { ja: "ダークモードに切替", en: "Switch to dark mode" },

  // Language
  "language.toggle": { ja: "言語切替", en: "Switch language" },
  "language.switchToJapanese": { ja: "日本語に切替", en: "Switch to Japanese" },
  "language.switchToEnglish": { ja: "英語に切替", en: "Switch to English" },

  // GitHub
  "github.repository": { ja: "GitHubリポジトリ", en: "GitHub repository" },
} as const satisfies Record<string, Record<Language, string>>
