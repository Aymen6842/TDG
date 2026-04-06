import { z } from "zod";

// ─── Shared Enums & Primitives ───────────────────────────────────────────────

export type ProjectStatus = "Running" | "Pending" | "Completed";
export type ProjectTypeEnum = "AGILE" | "FREESTYLE";

// ─── Sub-shapes (shared between response and frontend type) ──────────────────

export interface ProjectMemberInResponse {
  id: string;
  isManager: boolean;
  projectId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInvitationInResponse {
  id: string;
  email: string;
  status: string;
  token?: string;
  expiresAt: string;
  projectId: string;
  invitedById?: string;
  createdAt: string;
  updatedAt: string;
  isManager: boolean;
}

export interface ProjectContentInResponse {
  id: string;
  name: string;
  unaccentedName?: string;
  description?: string;
  details?: string;
  language?: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Backend Response Shape ───────────────────────────────────────────────────
// Matches exactly what the API returns. Edit this when the backend contract changes.

export interface ProjectInResponseType {
  id: string;
  paid: boolean;
  status: ProjectStatus;
  isArchived: boolean;
  businessUnit?: string;
  projectType: ProjectTypeEnum;
  startDate: string;           // ISO string from backend
  endDate: string;             // ISO string from backend
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  displayOrder: number;
  isFavorite?: boolean;
  repositoryUrl?: string;
  liveUrl?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  contents?: ProjectContentInResponse[];
  members?: ProjectMemberInResponse[];
  invitations?: ProjectInvitationInResponse[];
}

// ─── Frontend Shape ───────────────────────────────────────────────────────────
// What the rest of the app uses. Edit this when the UI needs change.

export interface ProjectMember {
  id: string;
  isManager: boolean;
  projectId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectInvitation {
  id: string;
  email: string;
  status: string;
  token?: string;
  expiresAt: Date;
  projectId: string;
  invitedById?: string;
  createdAt: Date;
  updatedAt: Date;
  isManager: boolean;
}

export interface ProjectContent {
  id: string;
  name: string;
  unaccentedName?: string;
  description?: string;
  details?: string;
  language?: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
  status: ProjectStatus;
  projectType: ProjectTypeEnum;
  displayOrder: number;
  isArchived: boolean;
  paid: boolean;
  businessUnit?: string;
  isFavorite?: boolean;
  members?: ProjectMember[];
  invitations?: ProjectInvitation[];
  contents?: ProjectContent[];
}
