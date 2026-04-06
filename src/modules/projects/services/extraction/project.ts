import { USE_MOCK } from "@/lib/mock-config"; // REMOVE THIS LINE FOR PROD
import { GET } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { ProjectType, ProjectInResponseType } from "@/modules/projects/types/projects";
import { castProjectToFrontend } from "@/modules/projects/types/cast-project";
import { mockRetrieveProjectBySlug } from "../mock/project.mock"; // REMOVE THIS LINE FOR PROD

export default async function retrieveProjectBySlug(slug: string): Promise<ProjectType | null> {
  if (USE_MOCK()) return mockRetrieveProjectBySlug(slug); // REMOVE THIS LINE FOR PROD

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await GET(`/projects/${slug}`, headers);
    return castProjectToFrontend(res.data as ProjectInResponseType);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => retrieveProjectBySlug(slug)) ?? null;
    }
    return null;
  }
}
