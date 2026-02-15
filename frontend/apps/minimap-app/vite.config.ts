import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { VitePWA } from "vite-plugin-pwa"

const __dirname = dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV !== "production"
const base = process.env.GITHUB_ACTIONS ? "/mermaid-viewer/" : "/"

// Plugin to replace %BASE_URL% placeholder in HTML
function htmlBaseUrlPlugin(): Plugin {
  return {
    name: "html-base-url",
    transformIndexHtml(html) {
      return html.replace(/%BASE_URL%/g, base)
    },
  }
}

export default defineConfig({
  base,
  plugins: [
    react(),
    htmlBaseUrlPlugin(),
    VitePWA({
      registerType: "prompt",
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      includeAssets: ["favicon.svg", "icons/*.png", "og-image.png"],
      devOptions: {
        enabled: true,
        type: "module",
      },
      manifest: {
        name: "Mermaid Viewer - インタラクティブ図表ビューワー",
        short_name: "Mermaid Viewer",
        description:
          "ミニマップ、パン＆ズーム機能を備えたMermaid図表ビューワー。フローチャート、シーケンス図、クラス図など25種類以上の図表をインタラクティブに表示。",
        theme_color: "#6366f1",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "any",
        scope: base,
        start_url: base,
        lang: "ja",
        dir: "ltr",
        categories: ["developer", "productivity", "utilities"],
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/maskable-icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "og-image.png",
            type: "image/png",
            sizes: "1200x630",
            form_factor: "wide",
            label: "Mermaid Viewer アプリケーション",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: [
      { find: "@", replacement: resolve(__dirname, "./src") },
      // In dev mode, resolve to source for HMR
      ...(isDev
        ? [
            {
              find: "@mermaid-demo/theme/tokens.css",
              replacement: resolve(__dirname, "../../packages/theme/src/generated/tokens.css"),
            },
            {
              find: "@mermaid-demo/theme/base/reset.css",
              replacement: resolve(__dirname, "../../packages/theme/src/base/reset.css"),
            },
            {
              find: "@mermaid-demo/theme/base/global.css",
              replacement: resolve(__dirname, "../../packages/theme/src/base/global.css"),
            },
            {
              find: "@mermaid-demo/mermaid",
              replacement: resolve(__dirname, "../../packages/mermaid/src"),
            },
            {
              find: "@mermaid-demo/ui",
              replacement: resolve(__dirname, "../../packages/ui/src"),
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
