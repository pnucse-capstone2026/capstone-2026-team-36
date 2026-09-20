import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ko from "./locales/ko.json";
import en from "./locales/en.json";
import ja from "./locales/ja.json";

const STORAGE_KEY = "language";

const savedLanguage = localStorage.getItem(STORAGE_KEY);
const defaultLanguage =
  savedLanguage === "ko" || savedLanguage === "en" || savedLanguage === "ja"
    ? savedLanguage
    : "ko";

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
    ja: { translation: ja },
  },
  lng: defaultLanguage,
  fallbackLng: "ko",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
  document.documentElement.setAttribute("lang", lng);
});

document.documentElement.setAttribute("lang", defaultLanguage);

export default i18n;
