import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

export enum LANG {
  TURN = "TURN",
  WHITE = "WHITE",
  BLACK = "BLACK",
  MOVES = "MOVES",
  CHECK = "CHECK",
  MATE = "MATE",
  DRAW = "DRAW",
  CASTLE = "CASTLE",
  DISPOSING_KING_TO_THREAT = "DISPOSING_KING_TO_THREAT",
  OPTIONS = "OPTIONS",
  ENABLE_ROTATION = "ENABLE_ROTATION",
  NEW_GAME = "NEW_GAME"
}

const resources = {
  ru: {
    translation: {
      [LANG.NEW_GAME]: "Новая игра",
      [LANG.TURN]: "Ход",
      [LANG.WHITE]: "Белые",
      [LANG.BLACK]: "Черные",
      [LANG.MOVES]: "Ходы (нажмите, чтобы вернуться)",
      [LANG.CHECK]: "Шах",
      [LANG.MATE]: "Мат",
      [LANG.DRAW]: "Ничья",
      [LANG.CASTLE]: "рокировка",
      [LANG.DISPOSING_KING_TO_THREAT]: "Нельзя подставлять короля под угрозу",
      [LANG.OPTIONS]: "Настройки",
      [LANG.ENABLE_ROTATION]: "Поворот поля при ходе"
    }
  },
  en: {
    translation: {
      [LANG.NEW_GAME]: "New game",
      [LANG.TURN]: "Turn",
      [LANG.WHITE]: "White",
      [LANG.BLACK]: "Black",
      [LANG.MOVES]: "Moves (click to traverse)",
      [LANG.CHECK]: "Check",
      [LANG.MATE]: "Mate",
      [LANG.DRAW]: "Draw",
      [LANG.CASTLE]: "castle",
      [LANG.DISPOSING_KING_TO_THREAT]: "Cannot dispose king to threat",
      [LANG.OPTIONS]: "Options",
      [LANG.ENABLE_ROTATION]: "Rotate field on move"
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
