import { LanguageCode } from "@/types/languages";

/**
 * This function formats a given date into a relative time string (e.g., "3 days ago", "in 2 hours")
 * @param createdDate
 * @param locale - The language code for text localization
 * @returns  A formatted relative time string
 */
export function formatRelativeDate(createdDate: string | Date, locale: LanguageCode) {
  const rtf = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto"
  });

  const date = new Date(createdDate);
  const now = new Date();

  const diffMs = date.getTime() - now.getTime();

  const seconds = Math.round(diffMs / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const weeks = Math.round(days / 7);
  const months = Math.round(days / 30);
  const years = Math.round(days / 365);

  if (Math.abs(seconds) < 10) return "just now";
  if (Math.abs(minutes) < 1) return rtf.format(seconds, "second");
  if (Math.abs(hours) < 1) return rtf.format(minutes, "minute");
  if (Math.abs(days) < 1) return rtf.format(hours, "hour");
  if (Math.abs(weeks) < 1) return rtf.format(days, "day");
  if (Math.abs(months) < 1) return rtf.format(weeks, "week");
  if (Math.abs(years) < 1) return rtf.format(months, "month");

  return rtf.format(years, "year");
}
