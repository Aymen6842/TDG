import { PATCH, POST } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";

export async function editProjectTaskComment(
  projectId: string,
  taskId: string,
  commentId: string,
  text: string,
): Promise<void> {
  if (text.trim() === "") {
    throw new Error("Comment cannot be empty");
  }

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    await PATCH(
      `/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
      headers,
      { content: text },
    );
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        editProjectTaskComment(projectId, taskId, commentId, text),
      );
    }
    throw error;
  }
}

export async function likeProjectTaskComment(
  projectId: string,
  taskId: string,
  commentId: string,
): Promise<void> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    await POST(
      `/projects/${projectId}/tasks/${taskId}/comments/${commentId}/like`,
      headers,
      {},
    );
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        likeProjectTaskComment(projectId, taskId, commentId),
      );
    }
    throw error;
  }
}
