import { USE_MOCK } from "@/lib/mock-config"; // REMOVE THIS LINE FOR PROD
import { POST, PATCH } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { CreateProjectPayload, UpdateProjectPayload } from "@/modules/projects/types/projects";
import { mockUploadProject } from "../mock/mutations.mock"; // REMOVE THIS LINE FOR PROD

export async function uploadProject(
  data: CreateProjectPayload | UpdateProjectPayload,
  id?: string
): Promise<void> {
  if (USE_MOCK()) return mockUploadProject(); // REMOVE THIS LINE FOR PROD

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    id
      ? await PATCH(`/projects/${id}`, headers, data)
      : await POST(`/projects/register`, headers, data);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => uploadProject(data, id));
    }
    throw error;
  }
}
