import type { Preview } from "@storybook/react-vite"

import "@mermaid-demo/theme/base/reset.css"
import "@mermaid-demo/theme/tokens.css"
import "@mermaid-demo/theme/base/global.css"

const preview: Preview = {
  parameters: {
    docs: {
      canvas: { withToolbar: true },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
