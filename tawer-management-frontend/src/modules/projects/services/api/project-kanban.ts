import { GET, PATCH } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import type { ProjectTaskInResponseType, ProjectTaskType } from "@/modules/projects/types/project-tasks";
import { castProjectTaskToFrontend } from "@/modules/projects/types/cast-project-task";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KanbanColumn {
  columnId: string;
  columnTitle: string;
  assigneeId?: string;
  tasks: ProjectTaskType[];
}

export interface KanbanBoardResponse {
  columns: KanbanColumn[];
}

export interface KanbanParams {
  sprintId?: string;
  epicId?: string;
  groupBy?: "assignee";
}

// ─── Service ──────────────────────────────────────────────────────────────────

export async function retrieveKanbanBoard(
  projectId: string,
  params?: KanbanParams,
): Promise<KanbanBoardResponse> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  const query = new URLSearchParams();
  if (params?.sprintId) query.set("sprintId", params.sprintId);
  if (params?.epicId) query.set("epicId", params.epicId);
  if (params?.groupBy) query.set("groupBy", params.groupBy);

  const qs = query.toString();
  const url = `/projects/${projectId}/kanban${qs ? `?${qs}` : ""}`;

  try {
    const res = await GET(url, headers);
    // Backend returns { TODO: [...tasks], IN_PROGRESS: [...tasks], wipLimits: {...} }
    // Normalize to our KanbanBoardResponse { columns: [...] }
    const raw = (res.data?.data ?? res.data) as Record<string, ProjectTaskInResponseType[] | unknown>;
    return normalizeKanbanResponse(raw);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => retrieveKanbanBoard(projectId, params));
    }
    throw error;
  }
}

function normalizeKanbanResponse(
  raw: Record<string, unknown>,
): KanbanBoardResponse {
  // If already in our normalized shape, return as-is
  if (Array.isArray((raw as any)?.columns)) {
    return raw as unknown as KanbanBoardResponse;
  }

  const STATUS_LABELS: Record<string, string> = {
    BACKLOG: "Backlog",
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    TESTING: "Testing",
    IN_REVIEW: "In Review",
    DONE: "Done",
  };

  const RESERVED = new Set(["wipLimits", "swimlanes", "meta"]);

  const columns: KanbanColumn[] = [];

  for (const [key, value] of Object.entries(raw)) {
    if (RESERVED.has(key)) continue;
    if (!Array.isArray(value)) continue;

    columns.push({
      columnId: key,
      columnTitle: STATUS_LABELS[key] ?? key.replace(/_/g, " "),
      tasks: (value as ProjectTaskInResponseType[]).map(castProjectTaskToFrontend),
    });
  }

  return { columns };
}

export interface MoveTaskInKanbanPayload {
  taskId: string;
  status: string;
  displayOrder: number;
}

export async function moveTaskInKanban(
  projectId: string,
  payload: MoveTaskInKanbanPayload,
): Promise<void> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    await PATCH(`/projects/${projectId}/kanban/move`, headers, payload);
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status === 401
    ) {
      return await refreshToken(() => moveTaskInKanban(projectId, payload));
    }
    throw error;
  }
}
