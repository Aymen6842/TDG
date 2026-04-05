import { generateMeta } from "@/lib/utils";
import ProjectsPageRender from "./render";

export async function generateMetadata() {
  return generateMeta({
    title: "Projects App",
    description:
      "Organize your tasks, add new tasks and view task details with the to-do list app template. Built with shadcn/ui, Next.js and Tailwind CSS.",
    canonical: "/dashboard/projects"
  });
}

export default async function Page() {
  return <ProjectsPageRender />;
}
