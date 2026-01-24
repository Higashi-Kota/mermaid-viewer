import { useLanguage } from "@mermaid-demo/i18n"
import { useAppTranslation } from "@mermaid-demo/messages"
import styles from "./LanguageSwitcher.module.css"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const { t } = useAppTranslation()

  function handleToggle() {
    setLanguage(language === "en" ? "ja" : "en")
  }

  const isEnglish = language === "en"

  return (
    <button
      type='button'
      className={styles.switcher}
      onClick={handleToggle}
      aria-label={t("language.toggle")}
      title={isEnglish ? t("language.switchToJapanese") : t("language.switchToEnglish")}
    >
      <span className={styles.label}>{language.toUpperCase()}</span>
    </button>
  )
}
