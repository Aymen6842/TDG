import {
  TimeEntryInResponseType,
  TimeEntryType,
} from "@/modules/projects/types/project-time-entries";

export function castTimeEntryToFrontend(
  raw: TimeEntryInResponseType,
): TimeEntryType {
  return {
    id: raw.id,
    taskId: raw.taskId,
    userId: raw.userId,
    workSessionId: raw.workSessionId ?? null,
    hours: raw.hours,
    description: raw.description,
    user: raw.user,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}
