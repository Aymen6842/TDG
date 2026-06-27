import { GET } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { ProjectTaskType, ProjectTaskInResponseType } from "@/modules/projects/types/project-tasks";
import { castProjectTaskToFrontend } from "@/modules/projects/types/cast-project-task";

interface Params {
  projectId: string;
  search?: string;
  status?: string;
  priority?: string;
  type?: string;
  assigneeId?: string;
  milestoneId?: string;
  epicId?: string;
}

export async function retrieveProjectTask(
  projectId: string,
  taskId: string,
): Promise<ProjectTaskType> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await GET(`/projects/${projectId}/tasks/${taskId}`, headers);
    const raw = (res.data?.data ?? res.data) as ProjectTaskInResponseType;
    return castProjectTaskToFrontend(raw);
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status === 401
    ) {
      return await refreshToken(() => retrieveProjectTask(projectId, taskId));
    }
    throw error;
  }
}

export default async function retrieveProjectTasks(params: Params): Promise<ProjectTaskType[]> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  const query = new URLSearchParams();
  if (params.search)      query.append("search", params.search);
  if (params.status)      query.append("status", params.status);
  if (params.priority)    query.append("priority", params.priority);
  if (params.type)        query.append("type", params.type);
  if (params.assigneeId)  query.append("assigneeId", params.assigneeId);
  if (params.milestoneId) query.append("milestoneId", params.milestoneId);
  if (params.epicId)      query.append("epicId", params.epicId);
  query.append("limit", "100");

  try {
    const res = await GET(`/projects/${params.projectId}/tasks?${query.toString()}`, headers);
    const tasks = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    return (tasks as ProjectTaskInResponseType[]).map(castProjectTaskToFrontend);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => retrieveProjectTasks(params)) ?? [];
    }
    return [];
  }
}
