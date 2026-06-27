import { GET, POST, PATCH, DELETE } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import {
  TimeEntryType,
  TimeEntryInResponseType,
  CreateTimeEntryPayload,
  UpdateTimeEntryPayload,
} from "@/modules/projects/types/project-time-entries";
import { castTimeEntryToFrontend } from "@/modules/projects/types/cast-time-entry";

export async function retrieveTimeEntries(
  projectId: string,
  taskId: string,
): Promise<TimeEntryType[]> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    const res = await GET(
      `/projects/${projectId}/tasks/${taskId}/time-entries`,
      headers,
    );
    const list = (res.data?.data ?? res.data) as TimeEntryInResponseType[];
    return list.map(castTimeEntryToFrontend);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (
        (await refreshToken(() => retrieveTimeEntries(projectId, taskId))) ?? []
      );
    }
    throw error;
  }
}

export async function createTimeEntry(
  projectId: string,
  taskId: string,
  payload: CreateTimeEntryPayload,
): Promise<TimeEntryType> {
  if (payload.hours <= 0) {
    throw new Error("Hours must be greater than zero");
  }
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    const res = await POST(
      `/projects/${projectId}/tasks/${taskId}/time-entries`,
      headers,
      payload,
    );
    const raw = (res.data?.data ?? res.data) as TimeEntryInResponseType;
    return castTimeEntryToFrontend(raw);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        createTimeEntry(projectId, taskId, payload),
      );
    }
    throw error;
  }
}

export async function updateTimeEntry(
  projectId: string,
  taskId: string,
  entryId: string,
  payload: UpdateTimeEntryPayload,
): Promise<TimeEntryType> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    const res = await PATCH(
      `/projects/${projectId}/tasks/${taskId}/time-entries/${entryId}`,
      headers,
      payload,
    );
    const raw = (res.data?.data ?? res.data) as TimeEntryInResponseType;
    return castTimeEntryToFrontend(raw);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        updateTimeEntry(projectId, taskId, entryId, payload),
      );
    }
    throw error;
  }
}

export async function deleteTimeEntry(
  projectId: string,
  taskId: string,
  entryId: string,
): Promise<void> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    await DELETE(
      `/projects/${projectId}/tasks/${taskId}/time-entries/${entryId}`,
      headers,
    );
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        deleteTimeEntry(projectId, taskId, entryId),
      );
    }
    throw error;
  }
}
