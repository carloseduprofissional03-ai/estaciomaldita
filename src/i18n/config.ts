// Configuração mínima de idioma: o site é 100% em Português (pt-BR).
// Mantida apenas porque src/main.tsx importa este módulo (arquivo protegido).
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/dm-sans";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

void i18n.use(initReactI18next).init({
  lng: "pt-BR",
  fallbackLng: "pt-BR",
  resources: {
    "pt-BR": { translation: {} },
  },
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

document.documentElement.lang = "pt-BR";

export default i18n;
