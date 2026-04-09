"use client";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useProject from "@/modules/projects/hooks/projects/use-project";
import Loading from "@/components/page-loader";
import ProjectTasks from "@/modules/projects/components/project-detail/project-task/project-tasks";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import AccessDenied from "@/components/error/access-denied";
import ProjectMembers from "@/modules/projects/components/project-detail/members/project-members";
import ProjectSettings from "@/modules/projects/components/project-detail/settings/project-settings";
import ProjectSprints from "@/modules/projects/components/project-detail/sprints/project-sprints";

interface Props {
  slug: string;
}

export default function ProjectDetailRender({ slug }: Props) {
  const t = useTranslations("modules.projects.project.details");
  const { user, isLoading: userLoading } = useCurrentUser();
  const { project, projectIsLoading } = useProject(slug);

  if (userLoading || projectIsLoading) return <Loading />;

  if (user && !hasPermissions(user.roles, "projectsManagement", "view")) return <AccessDenied />;

  if (!project) return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Project Not Found</h2>
        <p className="text-muted-foreground mt-1">The project you are looking for does not exist or has been moved.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">{(project as any).name || project.contents?.[0]?.name || "Unnamed Project"}</h1>
      </header>

      <Tabs defaultValue="tasks" className="w-full">
        <div className="border-b mb-6">
          <TabsList className="h-10 bg-transparent p-0">
            <TabsTrigger 
              value="tasks" 
              className="relative h-10 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              {t("tabs.tasks")}
            </TabsTrigger>
            <TabsTrigger 
              value="members" 
              className="relative h-10 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              {t("tabs.members")}
            </TabsTrigger>
            {project.projectType === "AGILE" && (
              <TabsTrigger 
                value="sprints" 
                className="relative h-10 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {t("tabs.sprints")}
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="details" 
              className="relative h-10 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              {t("tabs.details")}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="tasks" className="space-y-4 outline-none!">
          <ProjectTasks project={project} />
        </TabsContent>
        <TabsContent value="members" className="outline-none!">
          <ProjectMembers project={project} />
        </TabsContent>
        {project.projectType === "AGILE" && (
          <TabsContent value="sprints" className="outline-none!">
            <ProjectSprints project={project} />
          </TabsContent>
        )}
        <TabsContent value="details" className="outline-none!">
          <ProjectSettings project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
