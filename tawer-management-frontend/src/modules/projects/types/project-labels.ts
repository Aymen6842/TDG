// ─── Backend Response Shape ───────────────────────────────────────────────────

export interface LabelInResponseType {
  id: string;
  projectId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Frontend Shape ───────────────────────────────────────────────────────────

export interface LabelType {
  id: string;
  projectId: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Mutation Payload Types ───────────────────────────────────────────────────

export type CreateLabelPayload = {
  name: string;
  color: string;
};

export type UpdateLabelPayload = {
  name?: string;
  color?: string;
};
