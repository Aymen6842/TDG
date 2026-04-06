import { USE_MOCK } from "@/lib/mock-config"; // REMOVE THIS LINE FOR PROD
import { GET } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { ProjectType, ProjectInResponseType } from "@/modules/projects/types/projects";
import { castProjectToFrontend } from "@/modules/projects/types/cast-project";
import { mockRetrieveProjects } from "../mock/projects.mock"; // REMOVE THIS LINE FOR PROD

export default async function retrieveProjects(): Promise<ProjectType[]> {
  if (USE_MOCK()) return mockRetrieveProjects(); // REMOVE THIS LINE FOR PROD

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await GET(`/projects`, headers);
    return (res.data as ProjectInResponseType[]).map(castProjectToFrontend);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => retrieveProjects()) ?? [];
    }
    return [];
  }
}
