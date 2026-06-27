import { ProjectType, ProjectInResponseType } from "@/modules/projects/types/projects";
import { castProjectToFrontend } from "@/modules/projects/types/cast-project";
import { PaginationType } from "@/types/pagination";
import mockData from "../../mock_data/mock.json";

interface Params {
  page: number;
  limit?: number;
  name?: string;
  status?: string;
  businessUnit?: string;
  projectType?: string;
  paid?: boolean;
  sortBy?: string;
}

export async function mockRetrieveProjects(params: Params): Promise<{ data: ProjectType[]; pagination: PaginationType }> {
  const limit = params.limit ?? 10;
  let list = (mockData.projects as unknown as ProjectInResponseType[]).map(castProjectToFrontend);

  if (params.status)       list = list.filter(p => p.status === params.status);
  if (params.businessUnit) list = list.filter(p => p.businessUnit === params.businessUnit);
  if (params.projectType)  list = list.filter(p => p.projectType === params.projectType);
  if (params.paid !== undefined) list = list.filter(p => p.paid === params.paid);
  if (params.name)         list = list.filter(p => p.name.toLowerCase().includes(params.name!.toLowerCase()));

  const records = list.length;
  const totalPages = Math.max(1, Math.ceil(records / limit));
  const start = (params.page - 1) * limit;
  const data = list.slice(start, start + limit);

  return {
    data,
    pagination: { currentPage: params.page, records, totalPages },
  };
}
