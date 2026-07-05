import { getTranslations } from "next-intl/server";
import { generateMeta } from "@/lib/utils";
import ProjectsPageRender from "./render";

export async function generateMetadata() {
  const t = await getTranslations("metadata.projectsApp");

  return generateMeta({
    title: t("title"),
    description: t("description"),
    canonical: "/dashboard/projects"
  });
}

export default async function Page() {
  return <ProjectsPageRender />;
}
