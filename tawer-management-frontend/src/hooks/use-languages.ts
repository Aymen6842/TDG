// this file is used to manage the content on the backend side

import { useLocale } from "next-intl";
import { Language } from "@/types/languages";
import { FrontendLocale } from "@/types/locales";

const languages: Language[] = [{ code: "en", name: "English" }];

export const defaultLanguage = languages[0];

export function useLanguages() {
  const locale = useLocale();

  const currentLanguage: Language =
    languages.find((lang) => lang.code === locale) || defaultLanguage;

  return {
    languages,
    defaultLanguage,
    currentLanguage
  };
}

export function getLanguageBasedOnCurrentLocale(frontendLocale: FrontendLocale): Language {
  const language = languages.find((language) => frontendLocale.startsWith(language.code));

  return language ? language : defaultLanguage;
}
