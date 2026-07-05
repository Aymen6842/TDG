"use client";

import { useThemeConfig } from "@/components/active-theme";
import { Button } from "@/components/ui/button";
import { DEFAULT_THEME } from "@/lib/themes";
import { useTranslations } from "next-intl";

export function ResetThemeButton() {
  const { setTheme } = useThemeConfig();
  const t = useTranslations("shared.themeCustomizer");

  const resetThemeHandle = () => {
    setTheme(DEFAULT_THEME);
  };

  return (
    <Button variant="destructive" className="mt-4 w-full" onClick={resetThemeHandle}>
      {t("resetToDefault")}
    </Button>
  );
}
