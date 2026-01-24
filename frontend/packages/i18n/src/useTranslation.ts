import { useLanguage } from "./context"
import type { Language } from "./types"

type MessageDict = Record<string, Record<Language, string>>

export function createUseTranslation<T extends MessageDict>(messages: T) {
  return function useTranslation() {
    const { language } = useLanguage()

    function t(key: keyof T): string {
      const message = messages[key]
      if (!message) return String(key)
      return message[language] ?? message.en ?? String(key)
    }

    return { t, language }
  }
}
