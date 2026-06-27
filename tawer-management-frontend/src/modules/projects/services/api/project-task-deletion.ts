import { DELETE } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";

export async function deleteProjectTask(projectId: string, taskId: string): Promise<void> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    await DELETE(`/projects/${projectId}/tasks/${taskId}`, headers);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => deleteProjectTask(projectId, taskId));
    }
    throw error;
  }
}
