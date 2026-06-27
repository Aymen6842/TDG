import {
  parseBackendDate,
  parseBackendDateRequired,
} from "@/lib/parse-backend-date";
import {
  MilestoneInResponseType,
  MilestoneType,
} from "@/modules/projects/types/project-milestones";

export function castMilestoneToFrontend(
  raw: MilestoneInResponseType,
): MilestoneType {
  return {
    id: raw.id,
    projectId: raw.projectId,
    name: raw.name,
    description: raw.description,
    dueDate: parseBackendDate(raw.dueDate),
    completedAt:
      raw.completedAt !== null
        ? parseBackendDate(raw.completedAt)
        : null,
    totalTasks: raw.totalTasks ?? 0,
    doneTasks: raw.doneTasks ?? 0,
    progress: raw.progress ?? 0,
    createdAt: parseBackendDateRequired(raw.createdAt),
    updatedAt: parseBackendDateRequired(raw.updatedAt, raw.createdAt),
  };
}
