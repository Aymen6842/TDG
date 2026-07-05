"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { ProjectType } from "@/modules/projects/types/projects";
import useProjectSprints from "@/modules/projects/hooks/sprints/use-project-sprints";
import BurndownChart from "../../analytics/burndown-chart";
import VelocityChart from "../../analytics/velocity-chart";
import CapacityWidget from "../../analytics/capacity-widget";

interface Props {
  project: ProjectType;
}

export default function ProjectAnalytics({ project }: Props) {
  const t = useTranslations("modules.projects.project.analytics");
  const { sprints } = useProjectSprints(project.id);
  const [selectedSprintId, setSelectedSprintId] = React.useState<string>("");

  // Default to first running sprint, or first sprint
  React.useEffect(() => {
    if (sprints.length > 0 && !selectedSprintId) {
      const running = sprints.find((s) => s.status === "Running");
      setSelectedSprintId(running?.id ?? sprints[0].id);
    }
  }, [sprints, selectedSprintId]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Capacity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("capacity.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <CapacityWidget projectId={project.id} />
          </CardContent>
        </Card>

        {/* Velocity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("velocity.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <VelocityChart projectId={project.id} />
          </CardContent>
        </Card>
      </div>

      {/* Burndown — AGILE only, needs a sprint */}
      {project.projectType === "AGILE" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t("burndown.title")}</CardTitle>
              {sprints.length > 0 && (
                <Select value={selectedSprintId} onValueChange={setSelectedSprintId}>
                  <SelectTrigger className="w-[200px] h-8 text-sm">
                    <SelectValue placeholder={t("burndown.selectSprint")} />
                  </SelectTrigger>
                  <SelectContent>
                    {sprints.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedSprintId ? (
              <BurndownChart sprintId={selectedSprintId} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">{t("burndown.noSprintsAvailable")}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
