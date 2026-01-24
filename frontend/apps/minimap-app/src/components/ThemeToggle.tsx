import { useTheme } from "@mermaid-demo/i18n"
import { useAppTranslation } from "@mermaid-demo/messages"
import { Moon, Sun } from "lucide-react"
import styles from "./ThemeToggle.module.css"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const { t } = useAppTranslation()

  function handleToggle() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type='button'
      className={styles.toggle}
      onClick={handleToggle}
      aria-label={t("theme.toggle")}
      title={isDark ? t("theme.light") : t("theme.dark")}
    >
      {isDark ? <Sun size={20} aria-hidden='true' /> : <Moon size={20} aria-hidden='true' />}
    </button>
  )
}
