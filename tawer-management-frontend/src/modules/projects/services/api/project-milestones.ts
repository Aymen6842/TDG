import { GET, POST, PATCH, DELETE } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { PaginationType } from "@/types/pagination";
import {
  MilestoneType,
  MilestoneInResponseType,
  GanttType,
  CreateMilestonePayload,
  UpdateMilestonePayload,
} from "@/modules/projects/types/project-milestones";
import { castMilestoneToFrontend } from "@/modules/projects/types/cast-project-milestone";

export type MilestonesListResult = {
  data: MilestoneType[];
  pagination: PaginationType;
};

function extractPaginatedList<T>(body: unknown): {
  list: T[];
  pagination: PaginationType;
} {
  if (Array.isArray(body)) {
    return {
      list: body as T[],
      pagination: {
        records: body.length,
        currentPage: 1,
        totalPages: 1,
      },
    };
  }
  const paginated = body as { data: T[]; pagination: PaginationType };
  return {
    list: paginated.data ?? [],
    pagination: paginated.pagination ?? {
      records: paginated.data?.length ?? 0,
      currentPage: 1,
      totalPages: 1,
    },
  };
}

export async function retrieveMilestones(
  projectId: string,
  page = 1,
  limit = 100,
): Promise<MilestonesListResult> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await GET(`/projects/${projectId}/milestones`, headers, {
      params: { page, limit },
    });
    const body = res.data;
    const { list, pagination } = extractPaginatedList<MilestoneInResponseType>(body);
    return {
      data: list.map(castMilestoneToFrontend),
      pagination,
    };
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (
        (await refreshToken(() =>
          retrieveMilestones(projectId, page, limit),
        )) ?? {
          data: [],
          pagination: { records: 0, currentPage: 1, totalPages: 1 },
        }
      );
    }
    throw error;
  }
}

export async function createMilestone(
  projectId: string,
  payload: CreateMilestonePayload
): Promise<MilestoneType> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await POST(
      `/projects/${projectId}/milestones`,
      headers,
      payload
    );
    const raw = (res.data?.data ?? res.data) as MilestoneInResponseType;
    return castMilestoneToFrontend(raw);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => createMilestone(projectId, payload));
    }
    throw error;
  }
}

export async function updateMilestone(
  projectId: string,
  milestoneId: string,
  payload: UpdateMilestonePayload
): Promise<MilestoneType> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await PATCH(
      `/projects/${projectId}/milestones/${milestoneId}`,
      headers,
      payload
    );
    const raw = (res.data?.data ?? res.data) as MilestoneInResponseType;
    return castMilestoneToFrontend(raw);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        updateMilestone(projectId, milestoneId, payload)
      );
    }
    throw error;
  }
}

export async function deleteMilestone(
  projectId: string,
  milestoneId: string
): Promise<void> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    await DELETE(
      `/projects/${projectId}/milestones/${milestoneId}`,
      headers
    );
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        deleteMilestone(projectId, milestoneId)
      );
    }
    throw error;
  }
}

export async function completeMilestone(
  projectId: string,
  milestoneId: string
): Promise<void> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    await PATCH(
      `/projects/${projectId}/milestones/${milestoneId}/complete`,
      headers,
      {}
    );
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        completeMilestone(projectId, milestoneId)
      );
    }
    throw error;
  }
}

export async function retrieveGanttData(
  projectId: string
): Promise<GanttType> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await GET(
      `/projects/${projectId}/gantt`,
      headers
    );
    return (res.data?.data ?? res.data) as GanttType;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => retrieveGanttData(projectId));
    }
    throw error;
  }
}
