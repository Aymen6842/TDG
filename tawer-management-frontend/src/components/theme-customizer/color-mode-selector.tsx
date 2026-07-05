"use client";

import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

export function ColorModeSelector() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("shared");

  return (
    <div className="flex flex-col gap-4">
      <Label htmlFor="roundedCorner">{t("themeCustomizer.colorMode")}</Label>
      <ToggleGroup
        value={theme}
        type="single"
        onValueChange={(value) => setTheme(value)}
        className="*:border-input w-full gap-4 *:rounded-md *:border">
        <ToggleGroupItem variant="outline" value="light">
          {t("theme.light")}
        </ToggleGroupItem>
        <ToggleGroupItem
          variant="outline"
          value="dark"
          className="data-[variant=outline]:border-l-1">
          {t("theme.dark")}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
