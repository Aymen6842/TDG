import { useLocale } from "next-intl";
import { getBackendLocale } from "../utils/backend-locale";

export default function useBackendLocale() {
  const locale = useLocale();
  const backendLocale = getBackendLocale(locale);

  return {
    backendLocale
  };
}
