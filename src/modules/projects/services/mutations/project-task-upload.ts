import { USE_MOCK } from "@/lib/mock-config"; // REMOVE THIS LINE FOR PROD
import { POST, PATCH } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { mockUploadProjectTask } from "../mock/mutations.mock"; // REMOVE THIS LINE FOR PROD

// Clean API payload — only fields the backend accepts
export interface ProjectTaskPayload {
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  storyPoints?: number;
  dueDate?: string;
  assigneeId?: string;
  milestoneId?: string;
  epicId?: string;
  sprintId?: string;
  parentTaskId?: string;
}

interface Params {
  task: ProjectTaskPayload;
  id?: string;
  projectId: string;
  attachments?: File[];
  deletedAttachments?: string;
}

export default async function uploadProjectTask({ task, id, projectId, attachments, deletedAttachments }: Params) {
  if (USE_MOCK()) return mockUploadProjectTask(); // REMOVE THIS LINE FOR PROD

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  // If there are file attachments, use multipart/form-data
  if (attachments && attachments.length > 0) {
    const formData = new FormData();
    Object.entries(task).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    attachments.forEach((file) => formData.append("attachments", file));
    if (deletedAttachments) formData.append("deletedAttachments", deletedAttachments);

    try {
      const res = id
        ? await PATCH(`/projects/${projectId}/tasks/${id}`, { ...headers, "Content-Type": "multipart/form-data" }, formData)
        : await POST(`/projects/${projectId}/tasks`, { ...headers, "Content-Type": "multipart/form-data" }, formData);
      return res.data;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        return await refreshToken(() => uploadProjectTask({ task, id, projectId, attachments, deletedAttachments }));
      }
      throw error;
    }
  }

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
