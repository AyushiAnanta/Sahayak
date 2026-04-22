import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./translations/en.json";
import hi from "./translations/hi.json";
import mr from "./translations/mr.json";
import bn from "./translations/bn.json";
import pa from "./translations/pa.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
      bn: { translation: bn },
      pa: { translation: pa },
    },
    lng: localStorage.getItem("lang") || "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;