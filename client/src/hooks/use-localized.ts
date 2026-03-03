import { useTranslation } from "react-i18next";
import type { LocalizedText } from "@shared/types";

export function useLocalized() {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("pl") ? "pl" : "en";

  function t(text: LocalizedText): string {
    return text[lang] || text.en;
  }

  return { t, lang };
}
