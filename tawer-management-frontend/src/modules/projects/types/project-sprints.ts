// ─── Enums ────────────────────────────────────────────────────────────────────

export type SprintStatus = "Pending" | "Running" | "Stopped" | "Completed";

export type SprintLanguage = "Arabic" | "French" | "English";

// ─── Backend Response Shape ───────────────────────────────────────────────────
// Matches backend SprintSummaryDto / CreatedSprintDto / UpdatedSprintDto

export interface SprintAttachmentInResponse {
  id: string;
  attachment: string;
  createdAt: string;
}

export interface SprintContentInResponse {
  id: string;
  sprintId?: string;
  name: string;
  unaccentedName?: string;
  description?: string;
  details?: string | null;
  language?: SprintLanguage;
  createdAt: string;
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
  capacity?: number | null;
  // Flattened from content (backend flattens these from contents[0])
  name?: string;
  unaccentedName?: string;
  description?: string | null;
  details?: string | null;
  contents?: SprintContentInResponse[];
  attachments?: SprintAttachmentInResponse[];
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
  capacity?: number;
  content: SprintContentPayload[];
  attachments?: { file: string }[];
}

export interface UpdateSprintPayload {
  startDate?: string;
  endDate?: string;
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  status?: SprintStatus;
  capacity?: number;
  content?: SprintContentPayload[];
  attachments?: { file: string }[];
}

// ─── Frontend Shape ───────────────────────────────────────────────────────────

export interface SprintAttachment {
  id: string;
  attachment: string;
  createdAt: Date;
}

export interface SprintContent {
  id: string;
  sprintId?: string;
  name: string;
  unaccentedName?: string;
  description?: string;
  details?: string | null;
  language?: SprintLanguage;
  createdAt: Date;
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
  capacity?: number | null;
  contents?: SprintContent[];
  attachments?: SprintAttachment[];
  createdAt: Date;
  updatedAt: Date;
}
