import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectType, ProjectStatus } from "../types/projects";

interface ProjectsBulkBarProps {
  projects: ProjectType[] | undefined;
  selectedIds: Set<string>;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  onBulkStatusChange: (status: ProjectStatus) => void;
  onBulkArchive: () => void;
  onBulkRestore: () => void;
  onBulkDelete: () => void;
}

export function ProjectsBulkBar({
  projects,
  selectedIds,
  onToggleSelectAll,
  onClearSelection,
  onBulkStatusChange,
  onBulkArchive,
  onBulkRestore,
  onBulkDelete,
}: ProjectsBulkBarProps) {
  const t = useTranslations("modules.projects.list");

  const allPageSelected = (projects?.length ?? 0) > 0 && projects?.every(p => selectedIds.has(p.id));
  const somePageSelected = projects?.some(p => selectedIds.has(p.id)) && !allPageSelected;

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background px-4 py-2 text-sm">
      <Checkbox
        checked={allPageSelected}
        data-state={somePageSelected ? "indeterminate" : allPageSelected ? "checked" : "unchecked"}
        onCheckedChange={onToggleSelectAll}
        aria-label={t("selection.selectAll")}
      />
      {selectedIds.size === 0 ? (
        <span className="text-muted-foreground flex-1">{t("selection.selectAll")}</span>
      ) : (
        <>
          <span className="flex-1 font-medium">{t("selection.selected", { count: selectedIds.size })}</span>
          <Select onValueChange={(v) => {
            if (v === "__delete__") onBulkDelete();
            else if (v === "__archive__") onBulkArchive();
            else if (v === "__restore__") onBulkRestore();
            else onBulkStatusChange(v as ProjectStatus);
          }}>
            <SelectTrigger className="h-7 w-44 text-xs">
              <SelectValue placeholder={t("selection.applyAction")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">{t("selection.statusPending")}</SelectItem>
              <SelectItem value="Running">{t("selection.statusRunning")}</SelectItem>
              <SelectItem value="Stopped">{t("selection.statusStopped")}</SelectItem>
              <SelectItem value="Completed">{t("selection.statusCompleted")}</SelectItem>
              <SelectItem value="__archive__">{t("selection.archiveSelected")}</SelectItem>
              <SelectItem value="__restore__">{t("selection.restoreSelected")}</SelectItem>
              <SelectItem value="__delete__" className="text-destructive focus:text-destructive">
                {t("selection.deleteSelected")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button size="icon" variant="ghost" className="size-7" onClick={onClearSelection} aria-label={t("selection.clearSelection")}>
            <X className="size-3.5" />
          </Button>
        </>
      )}
    </div>
  );
}
