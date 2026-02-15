import {
  type FlowchartParseResult,
  isFlowchartDefinition,
  MermaidStore,
  MermaidViewer,
  type MermaidViewerHandle,
  parseFlowchart,
  StepListEditor,
  useMermaidStore,
} from "@mermaid-demo/mermaid"
import { useAppTranslation } from "@mermaid-demo/messages"
import type { ToggleGroupItem } from "@mermaid-demo/ui"
import { BottomDrawer, BottomDrawerBody, BottomDrawerHeader, ToggleGroup } from "@mermaid-demo/ui"
import { Github, Info, Maximize2, Menu, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import styles from "./App.module.css"
import { HorizontalSplitter } from "./components/HorizontalSplitter"
import { LanguageSwitcher } from "./components/LanguageSwitcher"
import { MermaidEditor } from "./components/MermaidEditor"
import { PWAUpdatePrompt } from "./components/PWAUpdatePrompt"
import { ShareButton } from "./components/ShareButton"
import { ThemeToggle } from "./components/ThemeToggle"
import { createCustomDiagram, type DiagramDefinition, SAMPLE_DIAGRAMS } from "./diagrams"
import { useIsMobile } from "./hooks/useMediaQuery"
import { getInitialShareState, useShareUrl } from "./hooks/useShareUrl"

// Create store at module level (following project guidelines)
const mermaidStore = MermaidStore.create()

// Get initial state from URL (before component mounts)
const initialShareState = getInitialShareState()

export function App() {
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramDefinition>(() =>
    initialShareState ? createCustomDiagram(initialShareState.definition) : SAMPLE_DIAGRAMS[0],
  )
  const [editorContent, setEditorContent] = useState<string>(() =>
    initialShareState ? initialShareState.definition : SAMPLE_DIAGRAMS[0].definition,
  )
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false)
  const [isDiagramDrawerOpen, setIsDiagramDrawerOpen] = useState(false)
  const viewerRef = useRef<MermaidViewerHandle>(null)
  const snapshot = useMermaidStore(mermaidStore)
  const isMobile = useIsMobile()
  const { t } = useAppTranslation()
  const { clearUrlParams } = useShareUrl()

  // Computed values
  const isFlowchart = isFlowchartDefinition(editorContent)
  const diagramItems: readonly ToggleGroupItem[] = SAMPLE_DIAGRAMS.map((diagram) => ({
    value: diagram.id,
    label: t(diagram.nameKey),
  }))

  // AST パース結果（非同期、外部ライブラリとの同期 = useEffect 適合）
  const parseResultRef = useRef<FlowchartParseResult>({
    nodeIds: [],
    nodeLabels: new Map<string, string>(),
  })
  const [, setParseVersion] = useState(0)

  useEffect(() => {
    if (!isFlowchart) {
      parseResultRef.current = { nodeIds: [], nodeLabels: new Map<string, string>() }
      setParseVersion((v) => v + 1)
      return
    }

    let cancelled = false
    parseFlowchart(editorContent).then((result) => {
      if (cancelled) return
      parseResultRef.current = result
      setParseVersion((v) => v + 1)
    })

    return () => {
      cancelled = true
    }
  }, [editorContent, isFlowchart])

  const { nodeIds, nodeLabels } = parseResultRef.current

  // Clear URL params after loading from share URL
  useEffect(() => {
    if (!initialShareState) return
    clearUrlParams()
  }, [clearUrlParams])

  // Inline handlers
  function handleDiagramSelect(diagram: DiagramDefinition) {
    // Skip if same diagram is selected
    if (selectedDiagram.id === diagram.id) return
    setSelectedDiagram(diagram)
    setEditorContent(diagram.definition)
    setDescriptions({})
    // Reset the store when switching diagrams
    mermaidStore.reset()
  }

  function handleEditorChange(value: string) {
    setEditorContent(value)
    // MermaidViewer automatically re-renders when definition prop changes
    // The cancelled flag pattern in MermaidViewer handles rapid changes gracefully
  }

  function handleFullscreenChange(_isFullscreen: boolean) {
    // console.log("Fullscreen changed:", isFullscreen)
  }

  function handleDescriptionChange(nodeId: string, description: string) {
    setDescriptions((prev) => ({ ...prev, [nodeId]: description }))
  }

  function handleStepClick(index: number) {
    viewerRef.current?.goToStep(index)
  }

  function openInfoDrawer() {
    setIsDiagramDrawerOpen(false)
    setIsInfoDrawerOpen(true)
  }

  function closeInfoDrawer() {
    setIsInfoDrawerOpen(false)
  }

  function openDiagramDrawer() {
    setIsInfoDrawerOpen(false)
    setIsDiagramDrawerOpen(true)
  }

  function closeDiagramDrawer() {
    setIsDiagramDrawerOpen(false)
  }

  function handleDiagramSelectMobile(diagram: DiagramDefinition) {
    handleDiagramSelect(diagram)
    closeDiagramDrawer()
  }

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{t("header.title")}</h1>
          <p className={styles.subtitle}>{t("header.subtitle")}</p>
        </div>
        <div className={styles.headerActions}>
          <a
            href='https://github.com/Higashi-Kota/mermaid-viewer'
            target='_blank'
            rel='noopener noreferrer'
            className={styles.iconLink}
            aria-label={t("github.repository")}
            title={t("github.repository")}
          >
            <Github size={20} aria-hidden='true' />
          </a>
          <a
            href='https://www.buymeacoffee.com/higashikota'
            target='_blank'
            rel='noopener noreferrer'
            className={styles.coffeeButton}
          >
            <img
              src='https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=higashikota&button_colour=FFDD00&font_colour=000000&font_family=Inter&outline_colour=000000&coffee_colour=ffffff'
              alt='Buy Me A Coffee'
            />
          </a>
          <ShareButton definition={editorContent} />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* Diagram Selector - Desktop only */}
      <div className={styles.selectorSection}>
        <ToggleGroup
          name='diagram-selector'
          items={diagramItems}
          value={selectedDiagram.id}
          onChange={(value) => {
            const diagram = SAMPLE_DIAGRAMS.find((d) => d.id === value)
            if (diagram) handleDiagramSelect(diagram)
          }}
          aria-label={t("aria.diagramSelection")}
        />
      </div>

      {/* Main Content */}
      <main
        className={styles.main}
        inert={isInfoDrawerOpen || isDiagramDrawerOpen ? true : undefined}
      >
        {/* Editor + Viewer Area */}
        {isMobile ? (
          /* Mobile: Preview only */
          <div className={styles.viewerArea}>
            <MermaidViewer
              ref={viewerRef}
              definition={selectedDiagram.definition}
              id={`minimap-demo-${selectedDiagram.id}`}
              showControls={true}
              showMinimap={false}
              showFullscreenButton={false}
              onFullscreenChange={handleFullscreenChange}
              store={mermaidStore}
              stepDescriptions={descriptions}
            />

            {/* Mobile floating menu - left center, vertical */}
            <nav className={styles.floatingMenu} aria-label={t("aria.mobileNavigation")}>
              <button
                type='button'
                className={styles.floatingBtn}
                onClick={openInfoDrawer}
                aria-label={t("aria.openInfo")}
                aria-expanded={isInfoDrawerOpen}
              >
                <Info size={18} aria-hidden='true' />
              </button>
              <button
                type='button'
                className={styles.floatingBtn}
                onClick={openDiagramDrawer}
                aria-label={t("aria.selectDiagram")}
                aria-expanded={isDiagramDrawerOpen}
              >
                <Menu size={18} aria-hidden='true' />
              </button>
              <button
                type='button'
                className={styles.floatingBtn}
                onClick={() => viewerRef.current?.openFullscreen()}
                aria-label={t("aria.openFullscreen")}
              >
                <Maximize2 size={18} aria-hidden='true' />
              </button>
            </nav>
          </div>
        ) : (
          /* Desktop: Sidebar + Editor + Preview with nested splitters */
          <HorizontalSplitter
            left={
              <aside className={styles.sidebar}>
                {isFlowchart ? (
                  <StepListEditor
                    nodeIds={nodeIds}
                    nodeLabels={nodeLabels}
                    descriptions={descriptions}
                    onDescriptionChange={handleDescriptionChange}
                    isActive={snapshot.stepZoom.isActive}
                    currentIndex={snapshot.stepZoom.currentIndex}
                    onStepClick={handleStepClick}
                    idPrefix='desktop-step'
                  />
                ) : null}
              </aside>
            }
            right={
              <HorizontalSplitter
                left={
                  <div className={styles.editorPane}>
                    <MermaidEditor
                      value={editorContent}
                      onChange={handleEditorChange}
                      error={snapshot.isError ? snapshot.errorMessage : null}
                    />
                  </div>
                }
                right={
                  <div className={styles.viewerArea}>
                    <MermaidViewer
                      ref={viewerRef}
                      definition={editorContent}
                      id={`minimap-demo-${selectedDiagram.id}`}
                      showControls={true}
                      showMinimap={true}
                      showFullscreenButton={true}
                      onFullscreenChange={handleFullscreenChange}
                      store={mermaidStore}
                      stepDescriptions={descriptions}
                    />
                  </div>
                }
                initialRatio={0.4}
              />
            }
            initialRatio={0.18}
            minRatio={0.1}
            maxRatio={0.35}
            aria-label='Resize sidebar and content panels'
          />
        )}
      </main>

      {/* Info drawer - mobile only */}
      <BottomDrawer
        open={isInfoDrawerOpen}
        onClose={closeInfoDrawer}
        aria-label={t("drawer.closeInfo")}
      >
        <BottomDrawerHeader>
          <h2 className={styles.drawerTitle}>{t("drawer.info")}</h2>
          <button
            type='button'
            className={styles.drawerCloseBtn}
            onClick={closeInfoDrawer}
            aria-label={t("drawer.closeInfo")}
          >
            <X size={20} aria-hidden='true' />
          </button>
        </BottomDrawerHeader>
        <BottomDrawerBody>
          {isFlowchart ? (
            <StepListEditor
              nodeIds={nodeIds}
              nodeLabels={nodeLabels}
              descriptions={descriptions}
              onDescriptionChange={handleDescriptionChange}
              isActive={snapshot.stepZoom.isActive}
              currentIndex={snapshot.stepZoom.currentIndex}
              onStepClick={handleStepClick}
              idPrefix='mobile-step'
            />
          ) : null}
        </BottomDrawerBody>
      </BottomDrawer>

      {/* Diagram drawer - mobile only */}
      <BottomDrawer
        open={isDiagramDrawerOpen}
        onClose={closeDiagramDrawer}
        aria-label={t("drawer.selectDiagram")}
      >
        <BottomDrawerHeader>
          <h2 className={styles.drawerTitle}>{t("drawer.selectDiagram")}</h2>
          <button
            type='button'
            className={styles.drawerCloseBtn}
            onClick={closeDiagramDrawer}
            aria-label={t("drawer.closeDiagram")}
          >
            <X size={20} aria-hidden='true' />
          </button>
        </BottomDrawerHeader>
        <BottomDrawerBody>
          <ToggleGroup
            name='diagram-selector-mobile'
            orientation='vertical'
            items={diagramItems}
            value={selectedDiagram.id}
            onChange={(value) => {
              const diagram = SAMPLE_DIAGRAMS.find((d) => d.id === value)
              if (diagram) handleDiagramSelectMobile(diagram)
            }}
            aria-label={t("aria.diagramSelection")}
          />
        </BottomDrawerBody>
      </BottomDrawer>

      {/* PWA Update Prompt */}
      <PWAUpdatePrompt />
    </div>
  )
}
