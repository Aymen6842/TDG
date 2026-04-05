import { routing } from "@/i18n/routing";
import { BackendLocale } from "@/types/locales";
import { getLocale } from "next-intl/server";

// This function maps frontend locale codes to backend locale codes.
export function getBackendLocale(frontendLocale: string | undefined): BackendLocale {
  switch (frontendLocale) {
    case "en":
      return "en";

    case "ar":
      return "ar";
    default:
      return "en"; // Default to 'en' if no valid frontend language is provided
  }
}

// This function gets backend locale on server side
export async function getBackendLocaleOnServerSide() {
  const locale = await getLocale();

  switch (locale) {
    case "en":
      return "en";

    case "ar":
      return "ar";
    default:
      return "en"; // Default to 'en' if no valid frontend language is provided
  }
}

// This function get backend locale requested on params
export function getBackendLocaleOnParams(params: { locale: string }) {
  if (routing.locales.length > 1) return `language=${params.locale}`;

  return "";
}
