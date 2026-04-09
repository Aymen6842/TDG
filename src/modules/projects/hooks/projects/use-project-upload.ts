import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectSchema, ProjectFormValues } from "../../validation/project.schema";
import { uploadProject, archiveProject, restoreProject } from "../../services";
import { ProjectType, CreateProjectPayload, UpdateProjectPayload, ProjectContentPayload } from "../../types/projects";

function buildDefaults(project?: ProjectType | null): ProjectFormValues {
  const start = new Date(); start.setMinutes(0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 7);
  return {
    name: project?.name ?? "",
    description: project?.description ?? "",
    details: project?.contents?.[0]?.details ?? "",
    language: project?.contents?.[0]?.language ?? undefined,
    businessUnit: project?.businessUnit ?? "TawerDev",
    projectType: project?.projectType ?? "AGILE",
    status: project?.status ?? "Pending",
    startDate: project?.startTime ? new Date(project.startTime).toISOString() : start.toISOString(),
    endDate: project?.endTime ? new Date(project.endTime).toISOString() : end.toISOString(),
    estimatedStartDate: project?.estimatedStartDate ? new Date(project.estimatedStartDate).toISOString() : undefined,
    estimatedEndDate: project?.estimatedEndDate ? new Date(project.estimatedEndDate).toISOString() : undefined,
    paid: project?.paid ?? false,
    isArchived: project?.isArchived ?? false,
    displayOrder: project?.displayOrder ?? 0,
    manager: project?.members?.find(m => m.isManager)?.userId ?? "",
  };
}

interface Params {
  project?: ProjectType | null;
  onSuccess?: () => void;
}

export default function useProjectUpload({ project, onSuccess }: Params) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: buildDefaults(project),
  });

  // Re-sync form whenever the project prop changes (sheet opens for a different project)
  useEffect(() => {
    form.reset(buildDefaults(project));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  async function onSubmit(data: ProjectFormValues) {
    setIsPending(true);
    setError("");
    try {
      if (project?.id) {
        // Update — businessUnit and projectType are immutable
        const existingContent = project.contents?.[0];

        // Handle archive/restore via dedicated endpoints — only call if state actually changed
        const archivedChanged = data.isArchived !== project.isArchived;
        if (archivedChanged) {
          data.isArchived ? await archiveProject(project.id) : await restoreProject(project.id);
        }

        // PATCH everything else (strip isArchived — backend manages it via /archive and /restore)
        const payload: UpdateProjectPayload = {
          status: data.status,
          startDate: data.startDate,
          endDate: data.endDate,
          estimatedStartDate: data.estimatedStartDate,
          estimatedEndDate: data.estimatedEndDate,
          paid: data.paid,
          displayOrder: data.displayOrder,
          contents: [{
            id: existingContent?.id,
            name: data.name,
            description: data.description,
            details: data.details,
            language: data.language || undefined,
          } as ProjectContentPayload],
        };
        await uploadProject(payload, project.id);
      } else {
        // Create — requires nested contents + members + manager
        const userId = data.manager || "";
        const payload: CreateProjectPayload = {
          businessUnit: data.businessUnit!,
          projectType: data.projectType,
          status: data.status,
          startDate: data.startDate,
          endDate: data.endDate,
          estimatedStartDate: data.estimatedStartDate,
          estimatedEndDate: data.estimatedEndDate,
          paid: data.paid,
          displayOrder: data.displayOrder,
          manager: userId,
          members: [{ userId, isManager: true }],
          contents: [{
            name: data.name,
            description: data.description,
            details: data.details,
            language: data.language || undefined,
          } as ProjectContentPayload],
        };
        await uploadProject(payload);
      }

      toast.success(project?.id ? "Project updated" : "Project created");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "An error occurred.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  }

  return { form, isPending, onSubmit, error };
}
