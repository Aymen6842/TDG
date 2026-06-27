"use client";
import ProjectDetail from "@/modules/projects/components/project-detail/project-detail";

interface Props {
  slug: string;
}

export default function ProjectDetailRender({ slug }: Props) {
  return <ProjectDetail slug={slug} />;
}
