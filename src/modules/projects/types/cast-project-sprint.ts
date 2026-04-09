import {
  SprintInResponseType,
  SprintType,
  SprintContent,
} from "@/modules/projects/types/project-sprints";

export function castSprintToFrontend(raw: SprintInResponseType): SprintType {
  const content = raw.contents?.[0];

  const contents: SprintContent[] = (raw.contents || []).map((c) => ({
    id: c.id,
    sprintId: c.sprintId,
    name: c.name,
    unaccentedName: c.unaccentedName,
    description: c.description,
    details: c.details,
    language: c.language,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
  }));

  return {
    id: raw.id,
    projectId: raw.projectId,
    createdById: raw.createdById,
    name: content?.name || "Unnamed Sprint",
    description: content?.description,
    details: content?.details,
    startDate: new Date(raw.startDate),
    endDate: new Date(raw.endDate),
    estimatedStartDate: new Date(raw.estimatedStartDate),
    estimatedEndDate: new Date(raw.estimatedEndDate),
    status: raw.status,
    contents,
    attachments: raw.attachments,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}
