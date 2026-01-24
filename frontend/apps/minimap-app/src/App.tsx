import { MermaidStore, MermaidViewer, useMermaidStore } from "@mermaid-demo/mermaid"
import { useAppTranslation } from "@mermaid-demo/messages"
import { Github, Info, Menu, X } from "lucide-react"
import { useState } from "react"
import styles from "./App.module.css"
import { LanguageSwitcher } from "./components/LanguageSwitcher"
import { ThemeToggle } from "./components/ThemeToggle"
import { type DiagramDefinition, SAMPLE_DIAGRAMS } from "./diagrams"
import { useIsMobile } from "./hooks/useMediaQuery"

// Create store at module level (following project guidelines)
const mermaidStore = MermaidStore.create()

export function App() {
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramDefinition>(SAMPLE_DIAGRAMS[0])
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false)
  const [isDiagramDrawerOpen, setIsDiagramDrawerOpen] = useState(false)
  const snapshot = useMermaidStore(mermaidStore)
  const isMobile = useIsMobile()
  const { t } = useAppTranslation()

  // Inline handlers - NO useCallback (following project guidelines)
  function handleDiagramSelect(diagram: DiagramDefinition) {
    // Skip if same diagram is selected
    if (selectedDiagram.id === diagram.id) return
    setSelectedDiagram(diagram)
    // Reset the store when switching diagrams
    mermaidStore.reset()
  }

  function handleFullscreenChange(_isFullscreen: boolean) {
    // console.log("Fullscreen changed:", isFullscreen)
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
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* Diagram Selector - Desktop only */}
      <fieldset className={styles.selectorSection}>
        <legend className={styles.visuallyHidden}>{t("aria.diagramSelection")}</legend>
        {SAMPLE_DIAGRAMS.map((diagram) => (
          <button
            key={diagram.id}
            type='button'
            aria-pressed={selectedDiagram.id === diagram.id}
            data-active={selectedDiagram.id === diagram.id ? "" : undefined}
            onClick={() => handleDiagramSelect(diagram)}
          >
            {t(diagram.nameKey)}
          </button>
        ))}
      </fieldset>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Left: Diagram Info - Desktop sidebar / Mobile drawer */}
        <aside className={styles.sidebar} data-drawer-open={isInfoDrawerOpen ? "" : undefined}>
          {/* Drawer handle - mobile only */}
          <div className={styles.drawerHandle}>
            <button
              type='button'
              className={styles.drawerCloseBtn}
              onClick={closeInfoDrawer}
              aria-label={t("drawer.closeInfo")}
            >
              <X size={20} aria-hidden='true' />
            </button>
          </div>

          <h2 className={styles.sidebarTitle}>{t(selectedDiagram.nameKey)}</h2>
          <p className={styles.sidebarDescription}>{t(selectedDiagram.descriptionKey)}</p>

          <div className={styles.stateSection}>
            <h3 className={styles.sectionTitle}>{t("sidebar.storeState")}</h3>
            <div className={styles.stateBox}>
              <div className={styles.stateRow}>
                <span className={styles.stateLabel}>{t("sidebar.fullscreen")}: </span>
                <span className={styles.stateValue}>{String(snapshot.isFullscreen)}</span>
              </div>
              <div className={styles.stateRow}>
                <span className={styles.stateLabel}>{t("sidebar.loading")}: </span>
                <span className={styles.stateValue}>{String(snapshot.isLoading)}</span>
              </div>
              <div className={styles.stateRow}>
                <span className={styles.stateLabel}>{t("sidebar.zoom")}: </span>
                <span className={styles.stateValue}>{(snapshot.zoom * 100).toFixed(0)}%</span>
              </div>
              <div className={styles.stateRow}>
                <span className={styles.stateLabel}>{t("sidebar.pan")}: </span>
                <span className={styles.stateValue}>
                  ({snapshot.transformState.panX.toFixed(0)},{" "}
                  {snapshot.transformState.panY.toFixed(0)})
                </span>
              </div>
              {snapshot.svgDimensions && (
                <div className={styles.stateRow}>
                  <span className={styles.stateLabel}>{t("sidebar.dimensions")}: </span>
                  <span className={styles.stateValue}>
                    {snapshot.svgDimensions.width} x {snapshot.svgDimensions.height}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className={styles.sectionTitle}>{t("instructions.title")}</h3>
            <ul className={styles.instructions}>
              <li>{t("instructions.pinchZoom")}</li>
              <li>{t("instructions.dragPan")}</li>
              <li>{t("instructions.zoomControls")}</li>
              <li>{t("instructions.minimapViewport")}</li>
              <li>{t("instructions.minimapNavigate")}</li>
              <li>{t("instructions.fullscreenButton")}</li>
              <li>{t("instructions.escapeClose")}</li>
            </ul>
          </div>
        </aside>

        {/* Drawer backdrop - mobile only, click to close */}
        {(isInfoDrawerOpen || isDiagramDrawerOpen) && (
          <div
            className={styles.drawerBackdrop}
            onClick={isInfoDrawerOpen ? closeInfoDrawer : closeDiagramDrawer}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
                isInfoDrawerOpen ? closeInfoDrawer() : closeDiagramDrawer()
              }
            }}
            tabIndex={-1}
            aria-hidden='true'
          />
        )}

        {/* Right: Diagram Viewer */}
        <div className={styles.viewerArea}>
          <MermaidViewer
            definition={selectedDiagram.definition}
            id={`minimap-demo-${selectedDiagram.id}`}
            showControls={true}
            showMinimap={!isMobile}
            showFullscreenButton={true}
            onFullscreenChange={handleFullscreenChange}
            store={mermaidStore}
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
          </nav>
        </div>

        {/* Diagram drawer - mobile only */}
        <aside
          className={styles.diagramDrawer}
          data-drawer-open={isDiagramDrawerOpen ? "" : undefined}
        >
          <div className={styles.diagramDrawerHeader}>
            <h2 className={styles.diagramDrawerTitle}>{t("drawer.selectDiagram")}</h2>
            <button
              type='button'
              className={styles.drawerCloseBtn}
              onClick={closeDiagramDrawer}
              aria-label={t("drawer.closeDiagram")}
            >
              <X size={20} aria-hidden='true' />
            </button>
          </div>

          <div className={styles.diagramDrawerContent}>
            {SAMPLE_DIAGRAMS.map((diagram) => (
              <button
                key={diagram.id}
                type='button'
                className={styles.diagramOption}
                data-selected={selectedDiagram.id === diagram.id ? "" : undefined}
                onClick={() => handleDiagramSelectMobile(diagram)}
              >
                {t(diagram.nameKey)}
              </button>
            ))}
          </div>
        </aside>
      </main>
    </div>
  )
}
