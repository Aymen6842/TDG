import { POST, DELETE } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";

export async function addProjectTaskComment(projectId: string, taskId: string, comment: string): Promise<void> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    await POST(`/projects/${projectId}/tasks/${taskId}/comments`, headers, { comment });
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => addProjectTaskComment(projectId, taskId, comment));
    }
    throw error;
  }
}

export async function deleteProjectTaskComment(projectId: string, taskId: string, commentId: string): Promise<void> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    await DELETE(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, headers);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => deleteProjectTaskComment(projectId, taskId, commentId));
    }
    throw error;
  }
}
