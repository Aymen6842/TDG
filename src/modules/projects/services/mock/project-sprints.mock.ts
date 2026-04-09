import { SprintType, SprintInResponseType } from "@/modules/projects/types/project-sprints";
import { castSprintToFrontend } from "@/modules/projects/types/cast-project-sprint";
import mockData from "../../mock_data/mock.json";

interface Params {
  projectId: string;
  status?: string;
}

export async function mockRetrieveProjectSprints(params: Params): Promise<SprintType[]> {
  const project = (mockData.projects as any[]).find((p) => p.id === params.projectId);
  if (!project?.sprints) return [];

  let sprints = project.sprints as SprintInResponseType[];
  if (params.status) sprints = sprints.filter((s) => s.status === params.status);

  return sprints.map(castSprintToFrontend);
}
