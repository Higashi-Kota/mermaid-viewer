import { I18nProvider, ThemeProvider } from "@mermaid-demo/i18n"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import { GlobalErrorOverlay } from "./components/GlobalErrorOverlay"
import { RootErrorBoundary } from "./components/RootErrorBoundary"
import "./App.css"

const rootElement = document.getElementById("root")
if (!rootElement) throw new Error("Root element not found")

createRoot(rootElement).render(
  <StrictMode>
    <GlobalErrorOverlay />
    <RootErrorBoundary>
      <ThemeProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </ThemeProvider>
    </RootErrorBoundary>
  </StrictMode>,
)
