import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import type { StorybookConfig } from "@storybook/react-vite"
import { mergeConfig } from "vite"

const __dirname = dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    return mergeConfig(config, {
      resolve: {
        alias: [
          {
            find: "@mermaid-demo/theme/tokens.css",
            replacement: resolve(__dirname, "../../../packages/theme/src/generated/tokens.css"),
          },
          {
            find: "@mermaid-demo/theme/base/reset.css",
            replacement: resolve(__dirname, "../../../packages/theme/src/base/reset.css"),
          },
          {
            find: "@mermaid-demo/theme/base/global.css",
            replacement: resolve(__dirname, "../../../packages/theme/src/base/global.css"),
          },
          {
            find: "@mermaid-demo/ui",
            replacement: resolve(__dirname, "../../../packages/ui/src"),
          },
          {
            find: "@mermaid-demo/mermaid",
            replacement: resolve(__dirname, "../../../packages/mermaid/src"),
          },
        ],
      },
    })
  },
}

export default config
