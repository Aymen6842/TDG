import { USE_MOCK } from "@/lib/mock-config"; // REMOVE THIS LINE FOR PROD
import { GET } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { SprintType, SprintInResponseType } from "@/modules/projects/types/project-sprints";
import { castSprintToFrontend } from "@/modules/projects/types/cast-project-sprint";
import { mockRetrieveProjectSprints } from "../mock/project-sprints.mock"; // REMOVE THIS LINE FOR PROD

interface Params {
  projectId: string;
  status?: string;
}

export default async function retrieveProjectSprints(params: Params): Promise<SprintType[]> {
  if (USE_MOCK()) return mockRetrieveProjectSprints(params); // REMOVE THIS LINE FOR PROD

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  const query = new URLSearchParams();
  if (params.status) query.append("status", params.status);

  try {
    const res = await GET(`/projects/${params.projectId}/sprints?${query.toString()}`, headers);
    return (res.data as SprintInResponseType[]).map(castSprintToFrontend);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => retrieveProjectSprints(params)) ?? [];
    }
    return [];
  }
}
