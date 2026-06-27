import { generateMeta } from "@/lib/utils";
import AssignedProjectTasks from "@/modules/projects/components/assigned-tasks/assigned-project-tasks";

export async function generateMetadata() {
  return generateMeta({ title: "Project Tasks", description: "Project tasks assigned to you.", canonical: "/dashboard/todo-list/project" });
}

export default function Page() {
  return <AssignedProjectTasks />;
}
