import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async (params) => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  const locale = (await params.requestLocale) || "en"; // Default to 'en' if no locale is provided

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
