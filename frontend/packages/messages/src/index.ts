import { createUseTranslation } from "@mermaid-demo/i18n"
import { appMessages } from "./app"
import { diagramMessages } from "./diagrams"

export const messages = { ...appMessages, ...diagramMessages }
export const useAppTranslation = createUseTranslation(messages)

export type MessageKey = keyof typeof messages

export { appMessages } from "./app"
export { diagramMessages } from "./diagrams"
