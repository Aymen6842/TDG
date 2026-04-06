import { ProjectTaskType, ProjectTaskInResponseType } from "@/modules/projects/types/project-tasks";
import { castProjectTaskToFrontend } from "@/modules/projects/types/cast-project-task";
import mockData from "../../mock_data/mock.json";

interface Params {
  projectId: string;
  search?: string;
  status?: string;
  priority?: string;
  type?: string;
  assigneeId?: string;
  milestoneId?: string;
  epicId?: string;
}

export async function mockRetrieveProjectTasks(params: Params): Promise<ProjectTaskType[]> {
  const project = mockData.projects.find((p) => p.id === params.projectId);
  if (!project) return [];

  let tasks = project.tasks as unknown as ProjectTaskInResponseType[];
  if (params.status)      tasks = tasks.filter((t) => t.status === params.status);
  if (params.priority)    tasks = tasks.filter((t) => t.priority === params.priority);
  if (params.type)        tasks = tasks.filter((t) => t.type === params.type);
  if (params.assigneeId)  tasks = tasks.filter((t) => t.assigneeId === params.assigneeId);
  if (params.milestoneId) tasks = tasks.filter((t) => t.milestoneId === params.milestoneId);
  if (params.epicId)      tasks = tasks.filter((t) => t.epicId === params.epicId);
  if (params.search) {
    const q = params.search.toLowerCase();
    tasks = tasks.filter((t) =>
      t.title.toLowerCase().includes(q) || t.key.toLowerCase().includes(q)
    );
  }

  return tasks.map(castProjectTaskToFrontend);
}
