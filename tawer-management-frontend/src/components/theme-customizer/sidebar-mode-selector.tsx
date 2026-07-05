"use client";

import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSidebar } from "@/components/ui/sidebar";
import { useTranslations } from "next-intl";

export function SidebarModeSelector() {
  const { toggleSidebar } = useSidebar();
  const t = useTranslations("shared.themeCustomizer");

  return (
    <div className="hidden flex-col gap-4 lg:flex">
      <Label>{t("sidebarMode")}</Label>
      <ToggleGroup
        type="single"
        onValueChange={() => toggleSidebar()}
        className="*:border-input w-full gap-4 *:rounded-md *:border">
        <ToggleGroupItem variant="outline" value="full">
          {t("default")}
        </ToggleGroupItem>
        <ToggleGroupItem
          variant="outline"
          value="centered"
          className="data-[variant=outline]:border-l-1">
          {t("icon")}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
