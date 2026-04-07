import {
  ProjectInResponseType,
  ProjectType,
  ProjectMember,
  ProjectInvitation,
  ProjectContent,
} from "@/modules/projects/types/projects";

export function castProjectToFrontend(raw: ProjectInResponseType): ProjectType {
  const content = raw.contents?.[0];

  const members: ProjectMember[] = (raw.members || []).map((m) => ({
    id: m.id,
    isManager: m.isManager,
    projectId: m.projectId,
    userId: m.userId,
    createdAt: new Date(m.createdAt),
    updatedAt: m.updatedAt ? new Date(m.updatedAt) : undefined,
    user: m.user,
  }));

  const invitations: ProjectInvitation[] = (raw.invitations || []).map((inv) => ({
    id: inv.id,
    email: inv.email,
    status: inv.status,
    token: inv.token,
    expiresAt: new Date(inv.expiresAt),
    projectId: inv.projectId,
    invitedById: inv.invitedById,
    createdAt: new Date(inv.createdAt),
    updatedAt: inv.updatedAt ? new Date(inv.updatedAt) : undefined,
    isManager: inv.isManager,
  }));

  const contents: ProjectContent[] = (raw.contents || []).map((c) => ({
    id: c.id,
    name: c.name,
    unaccentedName: c.unaccentedName,
    description: c.description,
    details: c.details,
    language: c.language,
    projectId: c.projectId,
    createdAt: new Date(c.createdAt),
    updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined,
  }));

  return {
    id: raw.id,
    slug: content?.name?.toLowerCase().replace(/ /g, "-") || raw.id,
    name: content?.name || "Unnamed Project",
    description: content?.description,
    repositoryUrl: raw.repositoryUrl,
    liveUrl: raw.liveUrl,
    startTime: new Date(raw.startDate),
    endTime: new Date(raw.endDate),
    estimatedStartDate: raw.estimatedStartDate ? new Date(raw.estimatedStartDate) : undefined,
    estimatedEndDate: raw.estimatedEndDate ? new Date(raw.estimatedEndDate) : undefined,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
    status: raw.status,
    projectType: raw.projectType,
    displayOrder: raw.displayOrder || 0,
    isArchived: raw.isArchived ?? false,
    paid: raw.paid ?? false,
    businessUnit: raw.businessUnit,
    isFavorite: raw.isFavorite,
    kanbanSettings: raw.kanbanSettings,
    createdById: raw.createdById,
    createdBy: raw.createdBy,
    members,
    invitations,
    contents,
  };
}
