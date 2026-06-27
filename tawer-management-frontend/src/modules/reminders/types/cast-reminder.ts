import {
  parseBackendDate,
  parseBackendDateRequired,
} from "@/lib/parse-backend-date";
import {
  ReminderInResponseType,
  ReminderSummaryInResponseType,
  ReminderType,
} from "@/modules/reminders/types/reminders";

export function castReminderSummaryToFrontend(
  raw: ReminderSummaryInResponseType,
): ReminderType {
  const createdAt = parseBackendDateRequired(raw.createdAt);

  return {
    id: raw.id,
    userId: raw.userId,
    entityType: raw.entityType,
    entityId: raw.entityId ?? null,
    projectId: null,
    taskId: null,
    milestoneId: null,
    message: raw.message ?? null,
    reminderAt: parseBackendDateRequired(raw.reminderAt),
    channels: [],
    isRecurring: raw.isRecurring ?? false,
    recurrenceRule: null,
    createdById: "",
    status: raw.status,
    sentAt: parseBackendDate(raw.sentAt ?? null),
    dismissedAt: null,
    createdAt,
    updatedAt: createdAt,
  };
}

export function castReminderToFrontend(
  raw: ReminderInResponseType,
): ReminderType {
  return {
    id: raw.id,
    userId: raw.userId,
    entityType: raw.entityType,
    entityId: raw.entityId,
    projectId: raw.projectId,
    taskId: raw.taskId,
    milestoneId: raw.milestoneId,
    message: raw.message,
    reminderAt: parseBackendDateRequired(raw.reminderAt),
    channels: Array.isArray(raw.channels) ? raw.channels : [],
    isRecurring: raw.isRecurring ?? false,
    recurrenceRule: raw.recurrenceRule ?? null,
    createdById: raw.createdById,
    status: raw.status,
    sentAt: parseBackendDate(raw.sentAt),
    dismissedAt: parseBackendDate(raw.dismissedAt),
    createdAt: parseBackendDateRequired(raw.createdAt),
    updatedAt: parseBackendDateRequired(raw.updatedAt, raw.createdAt),
  };
}
