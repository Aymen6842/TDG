import { ProjectType, ProjectInResponseType } from "@/modules/projects/types/projects";
import { castProjectToFrontend } from "@/modules/projects/types/cast-project";
import mockData from "../../mock_data/mock.json";

export async function mockRetrieveProjects(): Promise<ProjectType[]> {
  return (mockData.projects as unknown as ProjectInResponseType[]).map(castProjectToFrontend);
}
