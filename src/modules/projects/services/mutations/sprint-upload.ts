import { USE_MOCK } from "@/lib/mock-config"; // REMOVE THIS LINE FOR PROD
import { POST, PATCH } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { CreateSprintPayload, UpdateSprintPayload } from "@/modules/projects/types/project-sprints";
import { mockUploadSprint } from "../mock/mutations.mock"; // REMOVE THIS LINE FOR PROD

export async function uploadSprint(
  projectId: string,
  data: CreateSprintPayload | UpdateSprintPayload,
  id?: string
): Promise<void> {
  if (USE_MOCK()) return mockUploadSprint(); // REMOVE THIS LINE FOR PROD

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    id
      ? await PATCH(`/projects/${projectId}/sprints/${id}`, headers, data)
      : await POST(`/projects/${projectId}/sprints`, headers, data);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => uploadSprint(projectId, data, id));
    }
    throw error;
  }
}
