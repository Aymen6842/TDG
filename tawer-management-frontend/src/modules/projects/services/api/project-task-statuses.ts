import { GET, POST, PATCH, DELETE } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import {
  TaskStatusType,
  TaskStatusInResponseType,
  CreateTaskStatusPayload,
  UpdateTaskStatusPayload,
} from "@/modules/projects/types/project-task-statuses";

function castTaskStatusToFrontend(raw: TaskStatusInResponseType): TaskStatusType {
  return {
    id: raw.id,
    projectId: raw.projectId,
    name: raw.name,
    color: raw.color,
    order: raw.displayOrder,
    isSystem: raw.isSystem,
    allowedTransitions: raw.allowedTransitions,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

export async function retrieveTaskStatuses(
  projectId: string,
): Promise<TaskStatusType[]> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    const res = await GET(`/projects/${projectId}/task-statuses`, headers);
    const list = (res.data?.data ?? res.data) as TaskStatusInResponseType[];
    return list.map(castTaskStatusToFrontend);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => retrieveTaskStatuses(projectId))) ?? [];
    }
    throw error;
  }
}

export async function createTaskStatus(
  projectId: string,
  payload: CreateTaskStatusPayload,
): Promise<TaskStatusType> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    const res = await POST(
      `/projects/${projectId}/task-statuses`,
      headers,
      payload,
    );
    const raw = (res.data?.data ?? res.data) as TaskStatusInResponseType;
    return castTaskStatusToFrontend(raw);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => createTaskStatus(projectId, payload));
    }
    throw error;
  }
}

export async function updateTaskStatus(
  projectId: string,
  statusId: string,
  payload: UpdateTaskStatusPayload,
): Promise<TaskStatusType> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    const res = await PATCH(
      `/projects/${projectId}/task-statuses/${statusId}`,
      headers,
      payload,
    );
    const raw = (res.data?.data ?? res.data) as TaskStatusInResponseType;
    return castTaskStatusToFrontend(raw);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        updateTaskStatus(projectId, statusId, payload),
      );
    }
    throw error;
  }
}

export async function deleteTaskStatus(
  projectId: string,
  statusId: string,
): Promise<void> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    await DELETE(`/projects/${projectId}/task-statuses/${statusId}`, headers);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => deleteTaskStatus(projectId, statusId));
    }
    throw error;
  }
}
