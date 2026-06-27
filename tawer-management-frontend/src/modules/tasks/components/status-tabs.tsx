import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterTab } from "@/modules/tasks/types/tasks";
import { EnumTaskStatus } from "@/modules/tasks/types/tasks";
import { useTranslations } from "next-intl";
import { taskStatusNamed } from "../utils/enum";

interface StatusTabsProps {
  onTabChange: (tab: FilterTab) => void;
  activeTab: FilterTab;
}

const StatusTabs: React.FC<StatusTabsProps> = ({ onTabChange, activeTab }) => {
  const t = useTranslations("modules.tasks");
  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={(value) => onTabChange(value as FilterTab)}
      value={activeTab}>
      <TabsList>
        <TabsTrigger value="all">{t("upload.form.labels.allTasks")}</TabsTrigger>
        {Object.values(EnumTaskStatus).map((status) => (
          <TabsTrigger key={status} value={status}>
            {taskStatusNamed[status]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default StatusTabs;
