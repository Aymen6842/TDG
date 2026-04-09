import { GET } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { SprintType, SprintInResponseType } from "@/modules/projects/types/project-sprints";
import { castSprintToFrontend } from "@/modules/projects/types/cast-project-sprint";

interface Params {
  projectId: string;
  status?: string;
}

export default async function retrieveProjectSprints(params: Params): Promise<SprintType[]> {
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
