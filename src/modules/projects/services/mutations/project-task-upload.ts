import { USE_MOCK } from "@/lib/mock-config"; // REMOVE THIS LINE FOR PROD
import { POST, PATCH } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import { mockUploadProjectTask } from "../mock/mutations.mock"; // REMOVE THIS LINE FOR PROD

interface Params {
  task: Partial<ProjectTaskType>;
  id?: string;
  projectId: string;
}

export default async function uploadProjectTask({ task, id, projectId }: Params) {
  if (USE_MOCK()) return mockUploadProjectTask(); // REMOVE THIS LINE FOR PROD

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = id
      ? await PATCH(`/projects/${projectId}/tasks/${id}`, headers, task)
      : await POST(`/projects/${projectId}/tasks`, headers, task);
    return res.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => uploadProjectTask({ task, id, projectId }));
    }
    throw error;
  }
}
