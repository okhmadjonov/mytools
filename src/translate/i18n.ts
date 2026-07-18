import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./en.json";
import translationUZ from "./uz.json";
import translationRU from "./ru.json";

const resources = {
  en: translationEN,
  uz: translationUZ,
  ru: translationRU,
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("lng") || "uz",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
