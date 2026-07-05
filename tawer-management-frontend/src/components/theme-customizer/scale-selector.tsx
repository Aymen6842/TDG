"use client";

import { Label } from "@/components/ui/label";
import { useThemeConfig } from "@/components/active-theme";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BanIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export function ThemeScaleSelector() {
  const { theme, setTheme } = useThemeConfig();
  const t = useTranslations("shared.themeCustomizer");

  return (
    <div className="flex flex-col gap-4">
      <Label htmlFor="roundedCorner">{t("scale")}</Label>
      <div>
        <ToggleGroup
          value={theme.scale}
          type="single"
          onValueChange={(value) => setTheme({ ...theme, scale: value as any })}
          className="*:border-input w-full gap-3 *:rounded-md *:border">
          <ToggleGroupItem variant="outline" value="none">
            <BanIcon />
          </ToggleGroupItem>
          <ToggleGroupItem
            variant="outline"
            value="sm"
            className="text-xs data-[variant=outline]:border-l-1">
            {t("sizes.xs")}
          </ToggleGroupItem>
          <ToggleGroupItem
            variant="outline"
            value="lg"
            className="text-xs data-[variant=outline]:border-l-1">
            {t("sizes.lg")}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
