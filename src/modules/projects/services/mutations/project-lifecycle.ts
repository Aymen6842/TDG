import { USE_MOCK } from "@/lib/mock-config"; // REMOVE THIS LINE FOR PROD
import { POST, DELETE } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { ProjectInResponseType } from "@/modules/projects/types/projects";

// POST /projects/:projectId/archive
export async function archiveProject(projectId: string): Promise<ProjectInResponseType> {
  if (USE_MOCK()) return {} as ProjectInResponseType; // REMOVE THIS LINE FOR PROD

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await POST(`/projects/${projectId}/archive`, headers, {});
    return res.data;
  } catch (error: any) {
    if (error?.response?.status === 401) return await refreshToken(() => archiveProject(projectId));
    throw error;
  }
}

// POST /projects/:projectId/restore
export async function restoreProject(projectId: string): Promise<ProjectInResponseType> {
  if (USE_MOCK()) return {} as ProjectInResponseType; // REMOVE THIS LINE FOR PROD

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await POST(`/projects/${projectId}/restore`, headers, {});
    return res.data;
  } catch (error: any) {
    if (error?.response?.status === 401) return await refreshToken(() => restoreProject(projectId));
    throw error;
  }
}

// DELETE /projects/:id
export async function deleteProject(projectId: string): Promise<void> {
  if (USE_MOCK()) return; // REMOVE THIS LINE FOR PROD

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    await DELETE(`/projects/${projectId}`, headers);
  } catch (error: any) {
    if (error?.response?.status === 401) return await refreshToken(() => deleteProject(projectId));
    throw error;
  }
}
