import { ProjectType, ProjectInResponseType } from "@/modules/projects/types/projects";
import { castProjectToFrontend } from "@/modules/projects/types/cast-project";
import mockData from "../../mock_data/mock.json";

export async function mockRetrieveProjectBySlug(slug: string): Promise<ProjectType | null> {
  const found = (mockData.projects as unknown as ProjectInResponseType[]).find(
    (p) => (p.contents?.[0]?.name?.toLowerCase().replace(/ /g, "-") || p.id) === slug
  );
  return found ? castProjectToFrontend(found) : null;
}
