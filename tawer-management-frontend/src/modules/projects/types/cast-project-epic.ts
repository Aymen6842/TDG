import {
  EpicInResponseType,
  EpicType,
} from "@/modules/projects/types/project-epics";

export function castEpicToFrontend(raw: EpicInResponseType): EpicType {
  return {
    id: raw.id,
    projectId: raw.projectId,
    name: raw.name,
    description: raw.description,
    color: raw.color,
    startDate: raw.startDate ? new Date(raw.startDate) : undefined,
    endDate: raw.endDate ? new Date(raw.endDate) : undefined,
    totalTasks: raw.totalTasks ?? 0,
    doneTasks: raw.doneTasks ?? 0,
    progress: raw.progress ?? 0,
    createdAt: new Date(raw.createdAt),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(raw.createdAt),
  };
}
