import { GET } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { ProjectTaskType, ProjectTaskInResponseType } from "@/modules/projects/types/project-tasks";
import { castProjectTaskToFrontend } from "@/modules/projects/types/cast-project-task";
import { USE_MOCK } from "@/lib/mock-config";
import mockData from "../../mock_data/mock.json";

// In mock mode the current user is "mock-user-id" (matches mock.json assigneeId values)
const MOCK_ASSIGNEE_ID = "mock-user-id";

export interface AssignedProjectTasksParams {
  search?: string;
  status?: string;
  priority?: string;
  type?: string;
}

function mockRetrieveAssignedProjectTasks(params: AssignedProjectTasksParams): ProjectTaskType[] {
  let tasks: ProjectTaskInResponseType[] = [];

  for (const project of mockData.projects) {
    const projectTasks = (project.tasks as unknown as ProjectTaskInResponseType[]) ?? [];
    tasks = tasks.concat(projectTasks.filter((t) => t.assigneeId === MOCK_ASSIGNEE_ID));
  }

  if (params.status)   tasks = tasks.filter((t) => t.status === params.status);
  if (params.priority) tasks = tasks.filter((t) => t.priority === params.priority);
  if (params.type)     tasks = tasks.filter((t) => t.type === params.type);
  if (params.search) {
    const q = params.search.toLowerCase();
    tasks = tasks.filter((t) => t.title.toLowerCase().includes(q) || t.key.toLowerCase().includes(q));
  }

  return tasks.map(castProjectTaskToFrontend);
}

export default async function retrieveAssignedProjectTasks(
  params: AssignedProjectTasksParams
): Promise<ProjectTaskType[]> {
  if (USE_MOCK()) return mockRetrieveAssignedProjectTasks(params);

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
