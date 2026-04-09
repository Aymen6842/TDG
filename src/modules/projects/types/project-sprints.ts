// ─── Enums ────────────────────────────────────────────────────────────────────

export type SprintStatus = "Pending" | "Running" | "Stopped" | "Completed";

export type SprintLanguage = "Arabic" | "French" | "English";

// ─── Backend Response Shape ───────────────────────────────────────────────────

export interface SprintContentInResponse {
  id: string;
  sprintId: string;
  name: string;
  unaccentedName?: string;
  description?: string;
  details?: string | null;
  language?: SprintLanguage;
  createdAt: string;
  updatedAt: string;
}

export interface SprintInResponseType {
  id: string;
  projectId: string;
  createdById: string;
  startDate: string;
  endDate: string;
  estimatedStartDate: string;
  estimatedEndDate: string;
  status: SprintStatus;
  contents?: SprintContentInResponse[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Mutation Payload Types ───────────────────────────────────────────────────

export interface SprintContentPayload {
  id?: string;
  name: string;
  description?: string;
  details?: string;
  language?: SprintLanguage;
}

export interface CreateSprintPayload {
  startDate: string;
  endDate: string;
  estimatedStartDate: string;
  estimatedEndDate: string;
  status?: SprintStatus;
  contents: SprintContentPayload[];
}

export interface UpdateSprintPayload {
  startDate?: string;
  endDate?: string;
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  status?: SprintStatus;
  contents?: SprintContentPayload[];
}

// ─── Frontend Shape ───────────────────────────────────────────────────────────

export interface SprintContent {
  id: string;
  sprintId: string;
  name: string;
  unaccentedName?: string;
  description?: string;
  details?: string | null;
  language?: SprintLanguage;
  createdAt: Date;
  updatedAt: Date;
}

export interface SprintType {
  id: string;
  projectId: string;
  createdById: string;
  name: string;
  description?: string;
  details?: string | null;
  startDate: Date;
  endDate: Date;
  estimatedStartDate: Date;
  estimatedEndDate: Date;
  status: SprintStatus;
  contents?: SprintContent[];
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}
