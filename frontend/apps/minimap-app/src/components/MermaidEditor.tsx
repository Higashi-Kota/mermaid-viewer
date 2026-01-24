import { defaultKeymap, history, historyKeymap } from "@codemirror/commands"
import { EditorState } from "@codemirror/state"
import {
  placeholder as cmPlaceholder,
  drawSelection,
  EditorView,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  type ViewUpdate,
} from "@codemirror/view"
import { useEffect, useRef } from "react"
import styles from "./MermaidEditor.module.css"

export interface MermaidEditorProps {
  /** エディタの値 */
  readonly value: string
  /** 値変更時のコールバック */
  readonly onChange: (value: string) => void
  /** エラーメッセージ */
  readonly error?: string | null
  /** プレースホルダーテキスト */
  readonly placeholder?: string
  /** 追加のクラス名 */
  readonly className?: string
}

/**
 * CodeMirror 6ベースのMermaidエディタ
 *
 * - 行番号表示
 * - アクティブ行ハイライト
 * - Undo/Redo対応
 * - キーボードショートカット
 */
export function MermaidEditor({
  value,
  onChange,
  error,
  placeholder = "Enter mermaid diagram code...",
  className = "",
}: MermaidEditorProps) {
  const editorRootRef = useRef<HTMLDivElement>(null)
  const editorViewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  // Flag to skip onChange when updating content programmatically
  const skipNextOnChangeRef = useRef(false)

  // Callback refの同期
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally omit 'value' to prevent editor recreation on content changes (cursor position loss). Only recreate when placeholder changes.
  useEffect(() => {
    if (!editorRootRef.current || editorViewRef.current) return

    const editorTheme = EditorView.theme({
      "&": {
        height: "100%",
        fontSize: "var(--text-sm)",
      },
      "&.cm-focused": {
        outline: "none",
      },
      ".cm-scroller": {
        fontFamily: "var(--font-mono)",
        lineHeight: "var(--leading-relaxed)",
      },
      ".cm-gutters": {
        backgroundColor: "var(--editor-gutter-bg)",
        borderRight: "1px solid var(--editor-gutter-border)",
        color: "var(--editor-gutter-text)",
      },
      ".cm-lineNumbers .cm-gutterElement": {
        minWidth: "var(--editor-line-number-width)",
        textAlign: "right",
        paddingRight: "0.5rem",
      },
      ".cm-activeLineGutter": {
        backgroundColor: "var(--editor-active-line-bg)",
      },
      ".cm-content": {
        caretColor: "var(--editor-caret-color)",
        padding: "var(--space-2) 0",
      },
      ".cm-line": {
        paddingLeft: "var(--space-2)",
        paddingRight: "var(--space-2)",
      },
      ".cm-activeLine": {
        backgroundColor: "var(--editor-active-line-bg)",
      },
      ".cm-selectionBackground": {
        backgroundColor: "var(--editor-selection-bg) !important",
      },
      "&.cm-focused .cm-selectionBackground": {
        backgroundColor: "var(--editor-selection-bg) !important",
      },
    })

    const editorState = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        drawSelection(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({
          "aria-label": "Mermaid diagram code editor",
          "aria-multiline": "true",
        }),
        cmPlaceholder(placeholder),
        editorTheme,
        EditorView.updateListener.of((update: ViewUpdate) => {
          if (update.docChanged) {
            // Skip onChange if this is a programmatic update from value prop
            if (skipNextOnChangeRef.current) {
              skipNextOnChangeRef.current = false
              return
            }
            const nextContent = update.state.doc.toString()
            onChangeRef.current(nextContent)
          }
        }),
      ],
    })

    editorViewRef.current = new EditorView({
      state: editorState,
      parent: editorRootRef.current,
    })

    return () => {
      editorViewRef.current?.destroy()
      editorViewRef.current = null
    }
  }, [placeholder])

  // 外部からのvalue変更を反映（ダイアグラム選択時）
  useEffect(() => {
    const view = editorViewRef.current
    if (!view) return

    const currentContent = view.state.doc.toString()
    if (currentContent !== value) {
      // Mark as programmatic update to prevent onChange callback
      skipNextOnChangeRef.current = true
      view.dispatch({
        changes: {
          from: 0,
          to: currentContent.length,
          insert: value,
        },
      })
    }
  }, [value])

  return (
    <div className={`${styles.editor} ${className}`}>
      {error && (
        <div className={styles.errorBanner} role='alert'>
          {error}
        </div>
      )}
      <div ref={editorRootRef} className={styles.editorRoot} />
    </div>
  )
}
