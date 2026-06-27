"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import PersonalTasks from "@/modules/tasks/components";
import AssignedProjectTasks from "@/modules/projects/components/assigned-tasks/assigned-project-tasks";

export default function TodoListRender() {
  const t = useTranslations("modules.tasks");

  return (
    <div className="space-y-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      </header>

      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">{t("tabs.personal")}</TabsTrigger>
          <TabsTrigger value="project">{t("tabs.project")}</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4 outline-none!">
          <PersonalTasks />
        </TabsContent>

        <TabsContent value="project" className="mt-4 outline-none!">
          <AssignedProjectTasks />
        </TabsContent>
      </Tabs>
    </div>
  );
}
