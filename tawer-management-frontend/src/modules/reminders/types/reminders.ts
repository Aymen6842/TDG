// ─── Enums ────────────────────────────────────────────────────────────────────

export type ChannelType = "EMAIL" | "TELEGRAM" | "PUSH" | "NTFY";
export type ReminderEntityType = "TASK" | "SPRINT" | "MILESTONE" | "PROJECT" | "CUSTOM";
export type ReminderStatus = "PENDING" | "SENT" | "DISMISSED" | "FAILED" | "CANCELLED";

// ─── Backend Response Shape ───────────────────────────────────────────────────
// Matches the backend CreatedReminderDto / ReminderDetailDto / UpdatedReminderDto

export interface ReminderChannelInResponse {
  id: string;
  channel: ChannelType;
}

/** Lightweight list item from GET /projects/:projectId/reminders */
export interface ReminderSummaryInResponseType {
  id: string;
  userId: string;
  entityType: ReminderEntityType;
  entityId?: string | null;
  message?: string | null;
  reminderAt: string;
  isRecurring: boolean;
  status: ReminderStatus;
  sentAt?: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export interface ReminderInResponseType {
  id: string;
  userId: string;
  entityType: ReminderEntityType;
  entityId: string | null;
  projectId: string | null;
  taskId: string | null;
  milestoneId: string | null;
  message: string | null;
  reminderAt: string;
  channels: ReminderChannelInResponse[];
  isRecurring: boolean;
  recurrenceRule: string | null;
  createdById: string;
  status: ReminderStatus;
  sentAt: string | null;
  dismissedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Frontend Shape ───────────────────────────────────────────────────────────

export interface ReminderChannelType {
  id: string;
  channel: ChannelType;
}

export interface ReminderType {
  id: string;
  userId: string;
  entityType: ReminderEntityType;
  entityId: string | null;
  projectId: string | null;
  taskId: string | null;
  milestoneId: string | null;
  message: string | null;
  reminderAt: Date;
  channels: ReminderChannelType[];
  isRecurring: boolean;
  recurrenceRule: string | null;
  createdById: string;
  status: ReminderStatus;
  sentAt: Date | null;
  dismissedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Mutation Payload Types ───────────────────────────────────────────────────
// Matches backend CreateReminderDto

export type CreateReminderPayload = {
  userId: string;
  entityType: ReminderEntityType;
  entityId?: string;
  message?: string;
  reminderAt: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
  channels?: ChannelType[];
};

// Matches backend UpdateReminderDto
export type UpdateReminderPayload = {
  message?: string;
  reminderAt?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
};
