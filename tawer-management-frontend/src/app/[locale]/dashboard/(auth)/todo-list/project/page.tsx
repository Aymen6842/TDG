import { getTranslations } from "next-intl/server";
import { generateMeta } from "@/lib/utils";
import AssignedProjectTasks from "@/modules/projects/components/assigned-tasks/assigned-project-tasks";

export async function generateMetadata() {
  const t = await getTranslations("metadata.todoListProject");

  return generateMeta({
    title: t("title"),
    description: t("description"),
    canonical: "/dashboard/todo-list/project"
  });
}

export default function Page() {
  return <AssignedProjectTasks />;
}
