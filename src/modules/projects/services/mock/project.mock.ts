import { ProjectType, ProjectInResponseType } from "@/modules/projects/types/projects";
import { castProjectToFrontend } from "@/modules/projects/types/cast-project";
import mockData from "../../mock_data/mock.json";

export async function mockRetrieveProjectById(id: string): Promise<ProjectType | null> {
  const found = (mockData.projects as unknown as ProjectInResponseType[]).find((p) => p.id === id);
  return found ? castProjectToFrontend(found) : null;
}
