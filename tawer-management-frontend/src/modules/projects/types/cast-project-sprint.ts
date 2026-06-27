import {
  SprintInResponseType,
  SprintType,
  SprintContent,
  SprintAttachment,
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
  }));

  const attachments: SprintAttachment[] = (raw.attachments || []).map((a) => ({
    id: a.id,
    attachment: a.attachment,
    createdAt: new Date(a.createdAt),
  }));

  return {
    id: raw.id,
    projectId: raw.projectId,
    createdById: raw.createdById,
    name: raw.name ?? content?.name ?? "Unnamed Sprint",
    description: raw.description ?? content?.description,
    details: raw.details ?? content?.details,
    startDate: new Date(raw.startDate),
    endDate: new Date(raw.endDate),
    estimatedStartDate: new Date(raw.estimatedStartDate),
    estimatedEndDate: new Date(raw.estimatedEndDate),
    status: raw.status,
    capacity: raw.capacity ?? null,
    contents,
    attachments,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}
