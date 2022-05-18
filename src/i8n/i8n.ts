import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ru: {
    translation: {
      "turn": "Ход",
      "White": "Белые",
      "Black": "Черные",
      "Moves (click to traverse)": "Ходы (нажмите, чтобы вернуться)",
      "check": "шах",
      "mate": "мат",
      "draw": "ничья"
    }
  },
  en: {
    translation: {
      "turn": "Turn",
      "White": "White",
      "Black": "Black",
      "Moves (click to traverse)": "Moves (click to traverse)",
      "check": "check",
      "mate": "mate",
      "draw": "draw"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    interpolation: {
      escapeValue: false
    }
  });