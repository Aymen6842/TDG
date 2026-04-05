import { BackendLocale } from "./locales";

export type LanguageCode = BackendLocale;
export type LanguageName = "English";

export interface Language {
  code: LanguageCode;
  name: LanguageName;
}
