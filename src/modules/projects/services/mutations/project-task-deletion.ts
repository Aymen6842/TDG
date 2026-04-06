import { USE_MOCK } from "@/lib/mock-config"; // REMOVE THIS LINE FOR PROD
import { DELETE } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { mockDeleteProjectTask } from "../mock/mutations.mock"; // REMOVE THIS LINE FOR PROD

export async function deleteProjectTask(projectId: string, taskId: string): Promise<void> {
  if (USE_MOCK()) return mockDeleteProjectTask(); // REMOVE THIS LINE FOR PROD

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
