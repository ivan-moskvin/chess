import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

const resources = {
  ru: {
    translation: {
      "turn": "Ход",
      "WHITE": "Белые",
      "BLACK": "Черные",
      "Moves (click to traverse)": "Ходы (нажмите, чтобы вернуться)",
      "check": "Шах",
      "mate": "Мат",
      "draw": "Ничья",
      "castle": "рокировка",
      "cannot dispose king to threat": "Нельзя подставлять короля под угрозу"
    }
  },
  en: {
    translation: {
      "turn": "Turn",
      "WHITE": "White",
      "BLACK": "Black",
      "Moves (click to traverse)": "Moves (click to traverse)",
      "check": "Check",
      "mate": "Mate",
      "draw": "Draw",
      "castle": "castle",
      "cannot dispose king to threat": "Cannot dispose king to threat"
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    interpolation: {
      escapeValue: false
    }
  })
