import { USE_MOCK } from "@/lib/mock-config"; // REMOVE THIS LINE FOR PROD
import { GET } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { ProjectType, ProjectInResponseType } from "@/modules/projects/types/projects";
import { castProjectToFrontend } from "@/modules/projects/types/cast-project";
import { PaginationType } from "@/types/pagination";
import { mockRetrieveProjects } from "../mock/projects.mock"; // REMOVE THIS LINE FOR PROD

interface Params {
  page: number;
  limit?: number;
  name?: string;
  status?: string;
  businessUnit?: string;
  paid?: boolean;
  sortBy?: string;
}

export default async function retrieveProjects(params: Params): Promise<{ data: ProjectType[]; pagination: PaginationType } | null> {
  if (USE_MOCK()) return mockRetrieveProjects(params); // REMOVE THIS LINE FOR PROD

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  const query = new URLSearchParams();
  query.append("page", String(params.page));
  if (params.limit)       query.append("limit", String(params.limit));
  if (params.name)        query.append("name", params.name);
  if (params.status)      query.append("status", params.status);
  if (params.businessUnit) query.append("businessUnit", params.businessUnit);
  if (params.paid !== undefined) query.append("paid", String(params.paid));
  if (params.sortBy)      query.append("sortBy", params.sortBy);

  try {
    const res = await GET(`/projects?${query.toString()}`, headers);
    return {
      data: (res.data.data as ProjectInResponseType[]).map(castProjectToFrontend),
      pagination: res.data.pagination as PaginationType,
    };
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => retrieveProjects(params)) ?? null;
    }
    return null;
  }
}
