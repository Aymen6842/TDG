// ─── Shared Enums & Primitives ───────────────────────────────────────────────

export type ProjectStatus = "Running" | "Pending" | "Stopped" | "Completed";
export type ProjectLanguage = "Arabic" | "French" | "English";
export type ProjectTypeEnum = "AGILE" | "FREESTYLE";
export type BusinessUnit = "TawerDev" | "TawerCreative";

// ─── Sub-shapes (shared between response and frontend type) ──────────────────

export interface ProjectMemberInResponse {
  id: string;
  isManager: boolean;
  projectId?: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
  user?: { id: string; name: string; email?: string };
}

export interface ProjectInvitationInResponse {
  id: string;
  email: string;
  status: string;
  token?: string;
  expiresAt: string;
  projectId?: string;
  invitedById?: string;
  createdAt: string;
  updatedAt?: string;
  isManager?: boolean;
}

export interface ProjectContentInResponse {
  id: string;
  name: string;
  unaccentedName?: string;
  description?: string;
  details?: string | null;
  language?: ProjectLanguage;
  projectId?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Backend Response Shape ───────────────────────────────────────────────────

export interface ProjectInResponseType {
  id: string;
  paid: boolean;
  status: ProjectStatus;
  isArchived: boolean;
  archivedAt?: string | null;
  businessUnit?: BusinessUnit;
  projectType: ProjectTypeEnum;
  startDate: string;
  endDate: string;
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  displayOrder: number;
  isFavorite?: boolean;
  repositoryUrl?: string;
  liveUrl?: string;
  kanbanSettings?: Record<string, number> | null;
  createdById?: string;
  createdBy?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
  contents?: ProjectContentInResponse[];
  members?: ProjectMemberInResponse[];
  invitations?: ProjectInvitationInResponse[];
}

// ─── Mutation Response DTOs ───────────────────────────────────────────────────

export interface CreatedProjectDto extends ProjectInResponseType {
  // POST /projects/register — flattened content fields included by backend
  name?: string;
  description?: string;
  details?: string;
}

export type UpdatedProjectDto = ProjectInResponseType;

export interface CreatedProjectMemberDto {
  id: string;
  isManager: boolean;
  projectId: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
  user?: { id: string; name: string; email?: string };
}

export type UpdatedProjectMemberDto = CreatedProjectMemberDto;

export interface CreatedInvitationDto {
  id: string;
  email: string;
  status: string;
  token?: string;
  expiresAt: string;
  projectId: string;
  invitedById?: string;
  isManager: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ─── Mutation Payload Types ───────────────────────────────────────────────────

export interface ProjectContentPayload {
  id?: string; // required for update, omit for create
  name: string;
  description?: string;
  details?: string;
  language?: ProjectLanguage;
}

export interface ProjectMemberPayload {
  userId: string;
  isManager: boolean;
}

export interface CreateProjectPayload {
  businessUnit: BusinessUnit;
  projectType?: ProjectTypeEnum;
  status?: ProjectStatus;
  startDate: string;
  endDate: string;
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  paid?: boolean;
  displayOrder?: number;
  manager: string;
  members: ProjectMemberPayload[];
  contents: ProjectContentPayload[];
}

export interface UpdateProjectPayload {
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  paid?: boolean;
  displayOrder?: number;
  kanbanSettings?: Record<string, number>;
  manager?: string;
  members?: ProjectMemberPayload[];
  contents?: ProjectContentPayload[];
}

export interface AddMemberPayload {
  isManager: boolean;
  userId?: string;   // for direct add
  email?: string;    // for invitation path
  expiresInDays?: number;
}

export interface UpdateMemberRolePayload {
  isManager: boolean;
}

export interface CreateInvitationPayload {
  email: string;
  isManager: boolean;
  expiresInDays?: number;
}

export interface AcceptInvitationPayload {
  token: string;
}

// ─── Frontend Shape ───────────────────────────────────────────────────────────

export interface ProjectMember {
  id: string;
  isManager: boolean;
  projectId?: string;
  userId: string;
  createdAt: Date;
  updatedAt?: Date;
  user?: { id: string; name: string; email?: string };
}

export interface ProjectInvitation {
  id: string;
  email: string;
  status: string;
  token?: string;
  expiresAt: Date;
  projectId?: string;
  invitedById?: string;
  createdAt: Date;
  updatedAt?: Date;
  isManager?: boolean;
}

export interface ProjectContent {
  id: string;
  name: string;
  unaccentedName?: string;
  description?: string;
  details?: string | null;
  language?: ProjectLanguage;
  projectId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ProjectType {
  id: string;
  slug: string;
  name: string;
  description?: string;
  repositoryUrl?: string;
  liveUrl?: string;
  startTime: Date;
  endTime: Date;
  estimatedStartDate?: Date;
  estimatedEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  status: ProjectStatus;
  projectType: ProjectTypeEnum;
  displayOrder: number;
  isArchived: boolean;
  paid: boolean;
  businessUnit?: BusinessUnit;
  isFavorite?: boolean;
  kanbanSettings?: Record<string, number> | null;
  createdById?: string;
  createdBy?: { id: string; name: string };
  members?: ProjectMember[];
  invitations?: ProjectInvitation[];
  contents?: ProjectContent[];
}
