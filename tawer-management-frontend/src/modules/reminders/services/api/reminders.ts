import { GET, POST, PATCH, DELETE } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { PaginationType } from "@/types/pagination";
import {
  ReminderType,
  ReminderInResponseType,
  ReminderSummaryInResponseType,
  CreateReminderPayload,
  UpdateReminderPayload,
} from "@/modules/reminders/types/reminders";
import {
  castReminderToFrontend,
  castReminderSummaryToFrontend,
} from "@/modules/reminders/types/cast-reminder";

export type RemindersListResult = {
  data: ReminderType[];
  pagination: PaginationType;
};

function extractPaginatedList<T>(body: unknown): {
  list: T[];
  pagination: PaginationType;
} {
  if (Array.isArray(body)) {
    return {
      list: body as T[],
      pagination: {
        records: body.length,
        currentPage: 1,
        totalPages: 1,
      },
    };
  }
  const paginated = body as { data: T[]; pagination: PaginationType };
  return {
    list: paginated.data ?? [],
    pagination: paginated.pagination ?? {
      records: paginated.data?.length ?? 0,
      currentPage: 1,
      totalPages: 1,
    },
  };
}

export async function retrieveReminders(
  projectId: string,
  page = 1,
  limit = 100,
): Promise<RemindersListResult> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    const res = await GET(`/projects/${projectId}/reminders`, headers, {
      params: { page, limit },
    });
    const body = res.data;
    const { list, pagination } = extractPaginatedList<ReminderSummaryInResponseType>(body);
    return {
      data: list.map(castReminderSummaryToFrontend),
      pagination,
    };
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (
        (await refreshToken(() => retrieveReminders(projectId, page, limit))) ?? {
          data: [],
          pagination: { records: 0, currentPage: 1, totalPages: 1 },
        }
      );
    }
    throw error;
  }
}

export async function createReminder(
  projectId: string,
  payload: CreateReminderPayload,
): Promise<ReminderType> {
  if (payload.channels && payload.channels.length === 0) {
    throw new Error("At least one channel is required");
  }
  if (payload.isRecurring && !payload.recurrenceRule) {
    throw new Error("recurrenceRule is required when isRecurring is true");
  }

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    const res = await POST(
      `/projects/${projectId}/reminders`,
      headers,
      payload,
    );
    const raw = (res.data?.data ?? res.data) as ReminderInResponseType;
    return castReminderToFrontend(raw);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => createReminder(projectId, payload));
    }
    throw error;
  }
}

export async function updateReminder(
  projectId: string,
  reminderId: string,
  payload: UpdateReminderPayload,
): Promise<ReminderType> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    const res = await PATCH(
      `/projects/${projectId}/reminders/${reminderId}`,
      headers,
      payload,
    );
    const raw = (res.data?.data ?? res.data) as ReminderInResponseType;
    return castReminderToFrontend(raw);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        updateReminder(projectId, reminderId, payload),
      );
    }
    throw error;
  }
}

export async function deleteReminder(
  projectId: string,
  reminderId: string,
): Promise<void> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    await DELETE(`/projects/${projectId}/reminders/${reminderId}`, headers);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => deleteReminder(projectId, reminderId));
    }
    throw error;
  }
}
