import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectFilterTab } from "@/modules/projects/store/projects";
import { useTranslations } from "next-intl";

interface StatusTabsProps {
  onTabChange: (tab: ProjectFilterTab) => void;
  activeTab: ProjectFilterTab;
}

const ProjectStatusTabs: React.FC<StatusTabsProps> = ({ onTabChange, activeTab }) => {
  const t = useTranslations("modules.projects.list.tabs");

  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={(value) => onTabChange(value as ProjectFilterTab)}
      value={activeTab}>
      <TabsList>
        <TabsTrigger value="all">{t("all")}</TabsTrigger>
        <TabsTrigger value="Running">{t("running")}</TabsTrigger>
        <TabsTrigger value="Pending">{t("pending")}</TabsTrigger>
        <TabsTrigger value="Completed">{t("completed")}</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default ProjectStatusTabs;
