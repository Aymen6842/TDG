"use client";;
import Loading from "@/components/page-loader";
import Error500 from "@/components/error/500";
import useProjects from "../hooks/projects/extraction/use-projects";
import ProjectContainer from "./project";

export default function ProjectsList() {
  const { projects, projectsAreLoading, projectsError } = useProjects();


  if (projectsAreLoading) {
    return <Loading />;
  }

  if (projectsError) {
    return <Error500 />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
      {projects?.map((project) => (
        <ProjectContainer
          key={project.id}
          project={project}
        />
      ))}
    </div>
  );
}
