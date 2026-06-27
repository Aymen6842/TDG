import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface FilterPanelProps {
  children: React.ReactNode;
  hasActiveFilters?: boolean;
  onClear?: () => void;
}

export function FilterPanel({ children, hasActiveFilters, onClear }: FilterPanelProps) {
  const t = useTranslations("modules.projects.list.filters");
  return (
    <div className="space-y-6 p-4">
      {children}
      {hasActiveFilters && onClear && (
        <div className="text-end">
          <Button variant="link" size="sm" className="px-0!" onClick={onClear}>
            {t("clearFilters")}
            <X className="ml-1 size-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
