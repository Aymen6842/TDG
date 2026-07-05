"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useProject from "@/modules/projects/hooks/projects/use-project";
import Loading from "@/components/page-loader";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import AccessDenied from "@/components/error/access-denied";
import ProjectTasks from "./project-task/project-tasks";
import ProjectMembers from "./members/project-members";
import ProjectSettings from "./settings/project-settings";
import ProjectSprints from "./sprints/project-sprints";
import ProjectEpics from "./epics/project-epics";
import ProjectMilestones from "./milestones/project-milestones";
import ProjectReminders from "./reminders/project-reminders";
import ProjectAnalytics from "./analytics/project-analytics";
import CopilotPanel from "@/modules/ai/components/copilot-panel";

interface Props {
  slug: string;
}

export default function ProjectDetail({ slug }: Props) {
  const t = useTranslations("modules.projects.project.details");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoading: userLoading } = useCurrentUser();
  const { project, projectIsLoading } = useProject(slug);

  // The active tab is driven by the `?tab=` param so citation chips in the
  // copilot can deep-link into any tab (and open a task via `?taskId=`).
  const activeTab = searchParams.get("tab") ?? "tasks";
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    if (value !== "tasks") params.delete("taskId");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (userLoading || projectIsLoading) return <Loading />;

  if (user && !hasPermissions(user.roles, "projectsManagement", "view")) return <AccessDenied />;

  if (!project) return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">{t("notFound.title")}</h2>
        <p className="text-muted-foreground mt-1">{t("notFound.description")}</p>
      </div>
    </div>
  );

  const tabTriggerClass = "relative h-10 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none";

  return (
    <div className="space-y-4">
      <header className="mb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/projects")} aria-label={t("backToProjectsAriaLabel")}>
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{(project as any).name || project.contents?.[0]?.name || t("unnamedProject")}</h1>
      </header>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="border-b mb-6">
          <TabsList className="h-10 bg-transparent p-0 flex-wrap">
            <TabsTrigger value="tasks" className={tabTriggerClass}>{t("tabs.tasks")}</TabsTrigger>
            <TabsTrigger value="copilot" className={tabTriggerClass}>{t("tabs.copilot")}</TabsTrigger>
            <TabsTrigger value="members" className={tabTriggerClass}>{t("tabs.members")}</TabsTrigger>
            {project.projectType === "AGILE" && (
              <TabsTrigger value="sprints" className={tabTriggerClass}>{t("tabs.sprints")}</TabsTrigger>
            )}
            {project.projectType === "AGILE" && (
              <TabsTrigger value="epics" className={tabTriggerClass}>{t("tabs.epics")}</TabsTrigger>
            )}
            <TabsTrigger value="milestones" className={tabTriggerClass}>{t("tabs.milestones")}</TabsTrigger>
            <TabsTrigger value="analytics" className={tabTriggerClass}>{t("tabs.analytics")}</TabsTrigger>
            <TabsTrigger value="reminders" className={tabTriggerClass}>{t("tabs.reminders")}</TabsTrigger>
            <TabsTrigger value="details" className={tabTriggerClass}>{t("tabs.details")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="tasks" className="space-y-4 outline-none!">
          <ProjectTasks project={project} />
        </TabsContent>
        <TabsContent value="copilot" className="outline-none!">
          <CopilotPanel projectId={project.id} />
        </TabsContent>
        <TabsContent value="members" className="outline-none!">
          <ProjectMembers project={project} />
        </TabsContent>
        {project.projectType === "AGILE" && (
          <TabsContent value="sprints" className="outline-none!">
            <ProjectSprints project={project} />
          </TabsContent>
        )}
        {project.projectType === "AGILE" && (
          <TabsContent value="epics" className="outline-none!">
            <ProjectEpics project={project} />
          </TabsContent>
        )}
        <TabsContent value="milestones" className="outline-none!">
          <ProjectMilestones project={project} />
        </TabsContent>
        <TabsContent value="analytics" className="outline-none!">
          <ProjectAnalytics project={project} />
        </TabsContent>
        <TabsContent value="reminders" className="outline-none!">
          <ProjectReminders project={project} />
        </TabsContent>
        <TabsContent value="details" className="outline-none!">
          <ProjectSettings project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
