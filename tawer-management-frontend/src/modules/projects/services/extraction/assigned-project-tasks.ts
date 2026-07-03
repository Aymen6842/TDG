import { GET } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { ProjectTaskType, ProjectTaskInResponseType } from "@/modules/projects/types/project-tasks";
import { castProjectTaskToFrontend } from "@/modules/projects/types/cast-project-task";

export interface AssignedProjectTasksParams {
  search?: string;
  status?: string;
  priority?: string;
  type?: string;
}

export default async function retrieveAssignedProjectTasks(
  params: AssignedProjectTasksParams
): Promise<ProjectTaskType[]> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  const query = new URLSearchParams();
  if (params.search)   query.append("search", params.search);
  if (params.status)   query.append("status", params.status);
  if (params.priority) query.append("priority", params.priority);
  if (params.type)     query.append("type", params.type);

  try {
    const res = await GET(`/project-tasks/assigned?${query.toString()}`, headers);
    const tasks = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    return (tasks as ProjectTaskInResponseType[]).map(castProjectTaskToFrontend);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => retrieveAssignedProjectTasks(params))) ?? [];
    }
    return [];
  }
}
