import { GET } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";

// ─── Frontend UI Types ────────────────────────────────────────────────────────

export interface BurndownPoint {
  date: string;
  remainingPoints: number;
}

export interface VelocityPoint {
  sprintId: string;
  sprintName?: string;
  completedPoints: number;
}

export interface CapacityType {
  totalCapacity: number;
  allocatedCapacity: number;
  remainingCapacity: number;
}

// ─── Backend Response Types ───────────────────────────────────────────────────

interface SprintBurndownResponse {
  chartData?: {
    date: string;
    idealRemaining: number;
    actualRemaining: number | null;
    completed: number;
    added: number;
  }[];
}

interface VelocityResponse {
  sprints?: {
    sprintId: string;
    name: string;
    completedPoints: number;
    capacity?: number | null;
  }[];
}

interface ProjectCapacityResponse {
  totalCapacityPoints: number;
  totalCommittedPoints: number;
  totalRemainingPoints: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export async function retrieveBurndown(
  sprintId: string,
): Promise<BurndownPoint[]> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    const res = await GET(`/sprints/${sprintId}/burndown`, headers);
    const body = (res.data?.data ?? res.data) as SprintBurndownResponse;
    return (body.chartData ?? []).map((point) => ({
      date: point.date,
      remainingPoints: point.actualRemaining ?? 0,
    }));
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => retrieveBurndown(sprintId))) ?? [];
    }
    throw error;
  }
}

export async function retrieveVelocity(
  projectId: string,
): Promise<VelocityPoint[]> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    const res = await GET(`/projects/${projectId}/velocity`, headers);
    const body = (res.data?.data ?? res.data) as VelocityResponse;
    return (body.sprints ?? []).map((sprint) => ({
      sprintId: sprint.sprintId,
      sprintName: sprint.name,
      completedPoints: sprint.completedPoints,
    }));
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => retrieveVelocity(projectId))) ?? [];
    }
    throw error;
  }
}

export async function retrieveProjectCapacity(
  projectId: string,
): Promise<CapacityType> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };
  try {
    const res = await GET(`/projects/${projectId}/capacity`, headers);
    const body = (res.data?.data ?? res.data) as ProjectCapacityResponse;
    return {
      totalCapacity: body.totalCapacityPoints,
      allocatedCapacity: body.totalCommittedPoints,
      remainingCapacity: body.totalRemainingPoints,
    };
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => retrieveProjectCapacity(projectId));
    }
    throw error;
  }
}
