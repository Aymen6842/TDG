import { getTranslations } from "next-intl/server";
import { generateMeta } from "@/lib/utils";
import PersonalTasks from "@/modules/tasks/components";

export async function generateMetadata() {
  const t = await getTranslations("metadata.todoListPersonal");

  return generateMeta({
    title: t("title"),
    description: t("description"),
    canonical: "/dashboard/todo-list/personal"
  });
}

export default function Page() {
  return <PersonalTasks />;
}
