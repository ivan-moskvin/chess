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
      "check": "шах",
      "mate": "мат",
      "draw": "Ничья",
      "castle": "рокировка"
    }
  },
  en: {
    translation: {
      "turn": "Turn",
      "WHITE": "White",
      "BLACK": "Black",
      "Moves (click to traverse)": "Moves (click to traverse)",
      "check": "check",
      "mate": "mate",
      "draw": "draw",
      "castle": "castle"
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
