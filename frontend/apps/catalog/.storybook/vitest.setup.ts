import "@testing-library/jest-dom/vitest"
import { setProjectAnnotations } from "@storybook/react-vite"
import { expect } from "vitest"
import * as axeMatchers from "vitest-axe/matchers"

import * as previewAnnotations from "./preview"

expect.extend(axeMatchers)

setProjectAnnotations(previewAnnotations)

// Mock ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

// Mock scrollIntoView
Element.prototype.scrollIntoView = () => {}

// Mock matchMedia
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    value: (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  })
}
