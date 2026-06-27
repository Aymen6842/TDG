// ─── Backend Response Shape ───────────────────────────────────────────────────
// Matches backend TaskTimeEntryDto

export interface TimeEntryInResponseType {
  id: string;
  taskId: string;
  userId: string;
  workSessionId?: string | null;
  hours: number;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
  };
}

// ─── Frontend Shape ───────────────────────────────────────────────────────────

export interface TimeEntryType {
  id: string;
  taskId: string;
  userId: string;
  workSessionId?: string | null;
  hours: number;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
  };
}

// ─── Mutation Payload Types ───────────────────────────────────────────────────
// Matches backend LogTimeEntryDto

export type CreateTimeEntryPayload = {
  hours: number;
  description?: string;
};

// Matches backend UpdateTimeEntryDto
export type UpdateTimeEntryPayload = {
  hours?: number;
  description?: string;
};
