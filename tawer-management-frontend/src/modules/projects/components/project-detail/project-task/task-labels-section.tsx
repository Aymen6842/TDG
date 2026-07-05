"use client";
import React from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslations } from "next-intl";
import { LabelType } from "@/modules/projects/types/project-labels";
import useProjectLabels from "@/modules/projects/hooks/labels/use-project-labels";
import useLabelUpload from "@/modules/projects/hooks/labels/use-label-upload";

interface Props {
  projectId: string;
  taskId: string;
  assignedLabels?: LabelType[];
}

export function TaskLabelsSection({ projectId, taskId, assignedLabels = [] }: Props) {
  const t = useTranslations("modules.projects.taskSections.labels");
  const { labels } = useProjectLabels(projectId);
  const { assignLabel, removeLabel } = useLabelUpload({ projectId });
  const [open, setOpen] = React.useState(false);

  const assignedIds = new Set(assignedLabels.map((l) => l.id));

  async function handleToggle(labelId: string) {
    if (assignedIds.has(labelId)) {
      await removeLabel(taskId, labelId);
    } else {
      await assignLabel(taskId, labelId);
    }
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{t("title")}</h4>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              <Plus className="size-3.5 mr-1" /> {t("add")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-2" align="end">
            {labels.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                {t("noneDefined")}
              </p>
            ) : (
              <div className="space-y-1">
                {labels.map((label) => (
                  <button
                    key={label.id}
                    onClick={() => handleToggle(label.id)}
                    className={`w-full flex items-center gap-2 rounded px-2 py-1.5 text-sm text-left transition-colors hover:bg-muted ${
                      assignedIds.has(label.id) ? "bg-muted" : ""
                    }`}
                  >
                    <span
                      className="inline-block size-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="flex-1 truncate">{label.name}</span>
                    {assignedIds.has(label.id) && (
                      <X className="size-3 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {assignedLabels.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {assignedLabels.map((label) => (
            <Badge
              key={label.id}
              variant="outline"
              className="gap-1 cursor-pointer hover:opacity-70 transition-opacity"
              style={{ borderColor: label.color, color: label.color }}
              onClick={() => removeLabel(taskId, label.id)}
            >
              <span
                className="inline-block size-2 rounded-full"
                style={{ backgroundColor: label.color }}
              />
              {label.name}
              <X className="size-2.5" />
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{t("noneAssigned")}</p>
      )}
    </div>
  );
}
