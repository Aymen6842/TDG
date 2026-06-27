import { GET, POST, PATCH, DELETE } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import {
  EpicType,
  EpicInResponseType,
  CreateEpicPayload,
  UpdateEpicPayload,
} from "@/modules/projects/types/project-epics";
import { castEpicToFrontend } from "@/modules/projects/types/cast-project-epic";

export async function retrieveEpics(projectId: string): Promise<EpicType[]> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await GET(`/projects/${projectId}/epics?limit=100`, headers);
    const list = (res.data?.data ?? res.data) as EpicInResponseType[];
    return list.map(castEpicToFrontend);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => retrieveEpics(projectId))) ?? [];
    }
    throw error;
  }
}

export async function createEpic(
  projectId: string,
  payload: CreateEpicPayload
): Promise<EpicType> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await POST(`/projects/${projectId}/epics`, headers, payload);
    const raw = (res.data?.data ?? res.data) as EpicInResponseType;
    return castEpicToFrontend(raw);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => createEpic(projectId, payload));
    }
    throw error;
  }
}

export async function updateEpic(
  projectId: string,
  epicId: string,
  payload: UpdateEpicPayload
): Promise<EpicType> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await PATCH(
      `/projects/${projectId}/epics/${epicId}`,
      headers,
      payload
    );
    const raw = (res.data?.data ?? res.data) as EpicInResponseType;
    return castEpicToFrontend(raw);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => updateEpic(projectId, epicId, payload));
    }
    throw error;
  }
}

export async function deleteEpic(
  projectId: string,
  epicId: string
): Promise<void> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    await DELETE(`/projects/${projectId}/epics/${epicId}`, headers);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => deleteEpic(projectId, epicId));
    }
    throw error;
  }
}
