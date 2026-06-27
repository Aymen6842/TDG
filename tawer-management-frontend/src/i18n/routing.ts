// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  localeDetection: true,
  locales: ["en"], // All supported locales
  defaultLocale: "en", // Your default locale
  localePrefix: "always" // Always show locale prefix in URL
});
