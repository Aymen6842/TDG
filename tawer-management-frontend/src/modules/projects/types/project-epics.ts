// ─── Backend Response Shape ───────────────────────────────────────────────────
// Matches exactly what the API returns. Edit this when the backend contract changes.

export interface EpicInResponseType {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  color?: string;
  startDate?: string;
  endDate?: string;
  totalTasks: number;
  doneTasks: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Frontend Shape ───────────────────────────────────────────────────────────
// What the rest of the app uses. Dates are converted to Date objects.

export interface EpicType {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  color?: string;
  startDate?: Date;
  endDate?: Date;
  totalTasks: number;
  doneTasks: number;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Mutation Payload Types ───────────────────────────────────────────────────

export type CreateEpicPayload = {
  name: string;
  description?: string;
  color?: string;
  startDate?: string;
  endDate?: string;
};

export type UpdateEpicPayload = {
  name?: string;
  description?: string;
  color?: string;
  startDate?: string;
  endDate?: string;
};
