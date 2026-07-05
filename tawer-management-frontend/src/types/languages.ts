import { FrontendLocale } from "./locales";

export type LanguageCode = FrontendLocale;
export type LanguageName = "English" | "Français";

export interface Language {
  code: LanguageCode;
  name: LanguageName;
}
