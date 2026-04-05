import { generateMeta } from "@/lib/utils";

import Tasks from "@/modules/tasks";


export async function generateMetadata() {
  return generateMeta({
    title: "Todo List App",
    description:
      "Organize your tasks, add new tasks and view task details with the to-do list app template. Built with shadcn/ui, Next.js and Tailwind CSS.",
    canonical: "/apps/tasks-list"
  });
}

export default async function Page() {

  return <Tasks />;
}
