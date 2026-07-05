"use client";

import { Label } from "@/components/ui/label";
import { useThemeConfig } from "@/components/active-theme";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTranslations } from "next-intl";

export function ContentLayoutSelector() {
  const { theme, setTheme } = useThemeConfig();
  const t = useTranslations("shared.themeCustomizer");

  return (
    <div className="hidden flex-col gap-4 lg:flex">
      <Label>{t("contentLayout")}</Label>
      <ToggleGroup
        value={theme.contentLayout}
        type="single"
        onValueChange={(value) => setTheme({ ...theme, contentLayout: value as any })}
        className="*:border-input w-full gap-4 *:rounded-md *:border">
        <ToggleGroupItem variant="outline" value="full">
          {t("full")}
        </ToggleGroupItem>
        <ToggleGroupItem
          variant="outline"
          value="centered"
          className="data-[variant=outline]:border-l-1">
          {t("centered")}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
