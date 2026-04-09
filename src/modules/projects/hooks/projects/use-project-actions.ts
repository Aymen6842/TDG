import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProjectType, ProjectStatus } from "../../types/projects";
import { archiveProject, restoreProject, deleteProject } from "../../services/mutations/project-lifecycle";
import { uploadProject } from "../../services/mutations/project-upload";

export default function useProjectActions(refresh: () => void) {
  const queryClient = useQueryClient();
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const handleStatusChange = async (project: ProjectType, status: ProjectStatus) => {
    try {
      await uploadProject({ status }, project.id);
      refresh();
      toast.success(`Project marked as ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed to update project status");
    }
  };

  const handleArchiveProject = async (project: ProjectType) => {
    if (archivingId === project.id) return;
    setArchivingId(project.id);
    try {
      project.isArchived
        ? await restoreProject(project.id)
        : await archiveProject(project.id);
      refresh();
      toast.success(project.isArchived ? "Project restored" : "Project archived");
    } catch {
      toast.error("Failed to update project");
    } finally {
      setArchivingId(null);
    }
  };

  const handleDeleteProject = async (project: ProjectType) => {
    try {
      await deleteProject(project.id);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      refresh();
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  return { archivingId, handleStatusChange, handleArchiveProject, handleDeleteProject };
}
