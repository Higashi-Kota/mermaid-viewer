import { createContext, type ReactNode, useContext, useState } from "react"
import { DEFAULT_LANGUAGE, type Language } from "./types"

interface I18nContextValue {
  language: Language
  setLanguage: (lang: Language) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

interface I18nProviderProps {
  children: ReactNode
  defaultLanguage?: Language
}

export function I18nProvider({ children, defaultLanguage }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return defaultLanguage ?? DEFAULT_LANGUAGE
    const stored = localStorage.getItem("language") as Language | null
    if (stored && (stored === "ja" || stored === "en")) {
      return stored
    }
    // Detect browser language
    const browserLang = navigator.language.split("-")[0]
    return browserLang === "ja" ? "ja" : (defaultLanguage ?? DEFAULT_LANGUAGE)
  })

  function setLanguage(lang: Language) {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
    document.documentElement.lang = lang
  }

  return <I18nContext.Provider value={{ language, setLanguage }}>{children}</I18nContext.Provider>
}

export function useLanguage() {
  const context = useContext(I18nContext)
  if (!context) throw new Error("useLanguage must be used within I18nProvider")
  return context
}
