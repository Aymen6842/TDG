import { GET, POST, PATCH } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import type { ProjectTaskType, ProjectTaskInResponseType } from "@/modules/projects/types/project-tasks";
import { castProjectTaskToFrontend } from "@/modules/projects/types/cast-project-task";

export async function retrieveBacklog(
  projectId: string,
): Promise<ProjectTaskType[]> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    const res = await GET(`/projects/${projectId}/backlog`, headers);
    const list = (res.data?.data ?? res.data) as ProjectTaskInResponseType[];
    return list.map(castProjectTaskToFrontend);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => retrieveBacklog(projectId))) ?? [];
    }
    throw error;
  }
}

export async function reorderBacklog(
  projectId: string,
  orderedTaskIds: string[],
): Promise<void> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    await PATCH(
      `/projects/${projectId}/backlog/reorder`,
      headers,
      {
        tasks: orderedTaskIds.map((taskId, displayOrder) => ({
          taskId,
          displayOrder,
        })),
      },
    );
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => reorderBacklog(projectId, orderedTaskIds));
    }
    throw error;
  }
}

export async function moveTaskToSprint(
  projectId: string,
  taskId: string,
  sprintId: string,
): Promise<void> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    await POST(
      `/projects/${projectId}/backlog/${taskId}/move-to-sprint`,
      headers,
      { sprintId },
    );
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        moveTaskToSprint(projectId, taskId, sprintId),
      );
    }
    throw error;
  }
}

export async function retrieveSprintTasks(
  projectId: string,
  sprintId: string,
): Promise<ProjectTaskType[]> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    const res = await GET(
      `/projects/${projectId}/sprints/${sprintId}/tasks`,
      headers,
    );
    const list = (res.data?.data ?? res.data) as ProjectTaskInResponseType[];
    return list.map(castProjectTaskToFrontend);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (
        (await refreshToken(() =>
          retrieveSprintTasks(projectId, sprintId),
        )) ?? []
      );
    }
    throw error;
  }
}

export async function bulkUpdateTaskStatus(
  projectId: string,
  taskIds: string[],
  status: string,
): Promise<void> {
  if (taskIds.length === 0) return;

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    await PATCH(
      `/projects/${projectId}/tasks/bulk-status`,
      headers,
      {
        tasks: taskIds.map((taskId) => ({ taskId, status })),
      },
    );
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        bulkUpdateTaskStatus(projectId, taskIds, status),
      );
    }
    throw error;
  }
}
