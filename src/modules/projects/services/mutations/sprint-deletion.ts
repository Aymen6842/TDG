import { USE_MOCK } from "@/lib/mock-config"; // REMOVE THIS LINE FOR PROD
import { DELETE } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { mockDeleteSprint } from "../mock/mutations.mock"; // REMOVE THIS LINE FOR PROD

export async function deleteSprint(projectId: string, sprintId: string): Promise<void> {
  if (USE_MOCK()) return mockDeleteSprint(); // REMOVE THIS LINE FOR PROD

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    await DELETE(`/projects/${projectId}/sprints/${sprintId}`, headers);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => deleteSprint(projectId, sprintId));
    }
    throw error;
  }
}
