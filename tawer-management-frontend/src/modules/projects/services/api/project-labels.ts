import { GET, POST, PATCH, DELETE } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import {
  LabelType,
  LabelInResponseType,
  CreateLabelPayload,
  UpdateLabelPayload,
} from "@/modules/projects/types/project-labels";
import { castLabelToFrontend } from "@/modules/projects/types/cast-project-label";

export async function retrieveLabels(projectId: string): Promise<LabelType[]> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    const res = await GET(`/projects/${projectId}/labels`, headers);
    const list = (res.data?.data ?? res.data) as LabelInResponseType[];
    return list.map(castLabelToFrontend);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => retrieveLabels(projectId))) ?? [];
    }
    throw error;
  }
}

export async function createLabel(
  projectId: string,
  payload: CreateLabelPayload,
): Promise<LabelType> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    const res = await POST(`/projects/${projectId}/labels`, headers, payload);
    const raw = (res.data?.data ?? res.data) as LabelInResponseType;
    return castLabelToFrontend(raw);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => createLabel(projectId, payload));
    }
    throw error;
  }
}

export async function updateLabel(
  projectId: string,
  labelId: string,
  payload: UpdateLabelPayload,
): Promise<LabelType> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    const res = await PATCH(
      `/projects/${projectId}/labels/${labelId}`,
      headers,
      payload,
    );
    const raw = (res.data?.data ?? res.data) as LabelInResponseType;
    return castLabelToFrontend(raw);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        updateLabel(projectId, labelId, payload),
      );
    }
    throw error;
  }
}

export async function deleteLabel(
  projectId: string,
  labelId: string,
): Promise<void> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    await DELETE(`/projects/${projectId}/labels/${labelId}`, headers);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => deleteLabel(projectId, labelId));
    }
    throw error;
  }
}

export async function assignLabelToTask(
  projectId: string,
  taskId: string,
  labelId: string,
): Promise<void> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    await POST(
      `/projects/${projectId}/tasks/${taskId}/labels/${labelId}`,
      headers,
      {},
    );
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        assignLabelToTask(projectId, taskId, labelId),
      );
    }
    throw error;
  }
}

export async function removeLabelFromTask(
  projectId: string,
  taskId: string,
  labelId: string,
): Promise<void> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    await DELETE(
      `/projects/${projectId}/tasks/${taskId}/labels/${labelId}`,
      headers,
    );
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        removeLabelFromTask(projectId, taskId, labelId),
      );
    }
    throw error;
  }
}
