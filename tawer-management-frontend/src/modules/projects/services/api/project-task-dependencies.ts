import { POST, DELETE } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";

export async function addTaskDependency(
  projectId: string,
  taskId: string,
  blockingTaskId: string,
): Promise<void> {
  if (taskId === blockingTaskId) {
    throw new Error("Self-dependency not allowed");
  }

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    await POST(
      `/projects/${projectId}/tasks/${taskId}/dependencies`,
      headers,
      { blockingTaskId },
    );
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        addTaskDependency(projectId, taskId, blockingTaskId),
      );
    }
    throw error;
  }
}

export async function removeTaskDependency(
  projectId: string,
  taskId: string,
  dependencyId: string,
): Promise<void> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    await DELETE(
      `/projects/${projectId}/tasks/${taskId}/dependencies/${dependencyId}`,
      headers,
    );
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        removeTaskDependency(projectId, taskId, dependencyId),
      );
    }
    throw error;
  }
}
