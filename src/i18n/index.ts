import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { resources, defaultNS, namespaces } from "./resources";

export type LanguageCode = "en" | "id";

// Language names are shown in their own language (endonyms), which is the
// convention for language pickers, so these labels stay constant across locales.
export const SUPPORTED_LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "id", label: "Indonesia" },
  { code: "en", label: "English" },
];

export const LANGUAGE_STORAGE_KEY = "cf.language";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    ns: namespaces as unknown as string[],
    fallbackLng: "en",
    supportedLngs: ["en", "id"],
    // Treat "en-US", "id-ID", etc. as their base language.
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    interpolation: {
      // React already escapes values, so i18next escaping would double-encode.
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"],
    },
    react: {
      // Resources are bundled synchronously, so Suspense would only add churn.
      useSuspense: false,
    },
  });

// Keep the document language in sync so screen readers and the browser pick the
// right pronunciation/hyphenation rules.
if (typeof document !== "undefined") {
  const applyDocumentLang = (lng: string | undefined) => {
    document.documentElement.lang = lng && lng.startsWith("id") ? "id" : "en";
  };
  applyDocumentLang(i18n.language);
  i18n.on("languageChanged", applyDocumentLang);
}

export default i18n;
