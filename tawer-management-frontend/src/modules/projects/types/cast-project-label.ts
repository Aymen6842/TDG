import {
  LabelInResponseType,
  LabelType,
} from "@/modules/projects/types/project-labels";

export function castLabelToFrontend(raw: LabelInResponseType): LabelType {
  return {
    id: raw.id,
    projectId: raw.projectId,
    name: raw.name,
    color: raw.color,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}
