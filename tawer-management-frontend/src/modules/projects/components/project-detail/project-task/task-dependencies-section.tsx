"use client";
import React from "react";
import { Link, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskDependencyType } from "@/modules/projects/types/project-tasks";
import {
  addTaskDependency,
  removeTaskDependency,
} from "@/modules/projects/services/api/project-task-dependencies";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface Props {
  projectId: string;
  taskId: string;
  dependencies?: TaskDependencyType[];
}

export function TaskDependenciesSection({ projectId, taskId, dependencies = [] }: Props) {
  const t = useTranslations("modules.projects.taskSections.dependencies");
  const queryClient = useQueryClient();
  const [adding, setAdding] = React.useState(false);
  const [blockingTaskId, setBlockingTaskId] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);

  async function handleAdd() {
    if (!blockingTaskId.trim()) return;
    setIsPending(true);
    try {
      await addTaskDependency(projectId, taskId, blockingTaskId.trim());
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      toast.success(t("addedToast"));
      setBlockingTaskId("");
      setAdding(false);
    } catch (err: any) {
      toast.error(err?.message || t("addFailedToast"));
    } finally {
      setIsPending(false);
    }
  }

  async function handleRemove(dependencyId: string) {
    try {
      await removeTaskDependency(projectId, taskId, dependencyId);
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      toast.success(t("removedToast"));
    } catch (err: any) {
      toast.error(err?.message || t("removeFailedToast"));
    }
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-1.5">
          <Link className="size-3.5" /> {t("title")}
          {dependencies.length > 0 && (
            <span className="text-xs text-muted-foreground">({dependencies.length})</span>
          )}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => setAdding((p) => !p)}
        >
          <Plus className="size-3.5 mr-1" /> {t("add")}
        </Button>
      </div>

      {adding && (
        <div className="flex gap-2">
          <Input
            value={blockingTaskId}
            onChange={(e) => setBlockingTaskId(e.target.value)}
            placeholder={t("blockingTaskIdPlaceholder")}
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            autoFocus
          />
          <Button size="sm" className="h-8" disabled={isPending} onClick={handleAdd}>
            {t("add")}
          </Button>
        </div>
      )}

      {dependencies.length > 0 ? (
        <div className="space-y-1">
          {dependencies.map((dep) => (
            <div
              key={dep.id}
              className="flex items-center justify-between bg-muted rounded px-3 py-1.5 text-sm"
            >
              <span className="font-mono text-xs text-muted-foreground">{dep.blockingTaskId}</span>
              <Button
                variant="ghost"
                size="sm"
                className="size-6 p-0 text-destructive opacity-60 hover:opacity-100"
                onClick={() => handleRemove(dep.id)}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        !adding && (
          <p className="text-xs text-muted-foreground">{t("empty")}</p>
        )
      )}
    </div>
  );
}
