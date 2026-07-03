import {
  parseBackendDate,
  parseBackendDateRequired,
} from "@/lib/parse-backend-date";
import {
  MilestoneInResponseType,
  MilestoneType,
  GanttInResponseType,
  GanttType,
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

export function castGanttDataToFrontend(raw: GanttInResponseType): GanttType {
  return {
    milestones: (raw.milestones ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      dueDate: parseBackendDate(m.dueDate),
      completedAt: parseBackendDate(m.completedAt),
      status: m.status,
    })),
    epics: (raw.epics ?? []).map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      startDate: parseBackendDate(e.startDate),
      endDate: parseBackendDate(e.endDate),
    })),
    sprints: (raw.sprints ?? []).map((s) => ({
      id: s.id,
      status: s.status,
      startDate: parseBackendDate(s.startDate),
      endDate: parseBackendDate(s.endDate),
    })),
    tasks: (raw.tasks ?? []).map((t) => ({
      id: t.id,
      key: t.key,
      title: t.title,
      type: t.type,
      priority: t.priority,
      status: t.status,
      dueDate: parseBackendDate(t.dueDate),
      completedAt: parseBackendDate(t.completedAt),
      storyPoints: t.storyPoints,
      epicId: t.epicId,
      sprintId: t.sprintId,
    })),
  };
}
