import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectSchema, ProjectFormValues } from "../../validation/project.schema";
import { uploadProject } from "../../services/mutations/project-upload";
import { ProjectType } from "../../types/projects";

interface Params {
  project?: ProjectType;
  onSuccess?: () => void;
}

export default function useProjectUpload({ project, onSuccess }: Params) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      details: project?.contents?.[0]?.details || "",
      repositoryUrl: project?.repositoryUrl || "",
      liveUrl: project?.liveUrl || "",
      startTime: project?.startTime ? new Date(project.startTime).toISOString() : new Date().toISOString(),
      endTime: project?.endTime ? new Date(project.endTime).toISOString() : new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
      status: project?.status || "Pending",
      projectType: project?.projectType || "AGILE",
      businessUnit: project?.businessUnit || "",
      paid: project?.paid || false,
      isArchived: project?.isArchived || false,
      displayOrder: project?.displayOrder || 0,
      language: project?.contents?.[0]?.language || "",
    },
  });

  async function onSubmit(data: ProjectFormValues) {
    setIsPending(true);
    setError("");
    try {
      await uploadProject(data, project?.id);
      toast.success(project?.id ? "Project updated" : "Project created");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.message || "An error occurred.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  }

  return { form, isPending, onSubmit, error };
}
