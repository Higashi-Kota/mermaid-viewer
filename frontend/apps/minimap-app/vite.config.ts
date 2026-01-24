import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __dirname = dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV !== "production"

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/mermaid-viewer/" : "/",
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@", replacement: resolve(__dirname, "./src") },
      // In dev mode, resolve to source for HMR
      ...(isDev
        ? [
            {
              find: "@mermaid-demo/mermaid/styles",
              replacement: resolve(__dirname, "../../packages/mermaid/src/styles/tokens.css"),
            },
            {
              find: "@mermaid-demo/mermaid",
              replacement: resolve(__dirname, "../../packages/mermaid/src"),
            },
          ]
        : []),
    ],
  },
  server: {
    port: 7777,
  },
  preview: {
    port: 7777,
  },
})
