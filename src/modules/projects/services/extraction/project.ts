import { USE_MOCK } from "@/lib/mock-config"; // REMOVE THIS LINE FOR PROD
import { GET } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { ProjectType, ProjectInResponseType } from "@/modules/projects/types/projects";
import { castProjectToFrontend } from "@/modules/projects/types/cast-project";
import { mockRetrieveProjectById } from "../mock/project.mock"; // REMOVE THIS LINE FOR PROD

export default async function retrieveProjectById(id: string): Promise<ProjectType | null> {
  if (USE_MOCK()) return mockRetrieveProjectById(id); // REMOVE THIS LINE FOR PROD

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await GET(`/projects/${id}`, headers);
    return castProjectToFrontend(res.data as ProjectInResponseType);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => retrieveProjectById(id)) ?? null;
    }
    return null;
  }
}
