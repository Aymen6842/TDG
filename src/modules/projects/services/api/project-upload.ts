import { POST, PATCH } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { CreateProjectPayload, UpdateProjectPayload } from "@/modules/projects/types/projects";

export async function uploadProject(
  data: CreateProjectPayload | UpdateProjectPayload,
  id?: string
): Promise<void> {
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
