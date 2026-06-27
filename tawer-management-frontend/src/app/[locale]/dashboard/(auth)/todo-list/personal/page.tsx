import { generateMeta } from "@/lib/utils";
import PersonalTasks from "@/modules/tasks/components";

export async function generateMetadata() {
  return generateMeta({ title: "Personal Tasks", description: "Your personal task list.", canonical: "/dashboard/todo-list/personal" });
}

export default function Page() {
  return <PersonalTasks />;
}
