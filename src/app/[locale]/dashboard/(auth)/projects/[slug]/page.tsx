import { generateMeta } from "@/lib/utils";
import ProjectDetailRender from "./render";

export async function generateMetadata() {
  return generateMeta({
    title: "Project Details",
    description: "View and manage tasks, members, and settings for this project.",
    canonical: ""
  });
}

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  return <ProjectDetailRender slug={slug} />;
}
