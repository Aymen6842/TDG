"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import useProjectCapacity from "@/modules/projects/hooks/analytics/use-project-capacity";

interface Props {
  projectId: string;
}

export default function CapacityWidget({ projectId }: Props) {
  const t = useTranslations("modules.projects.project.analytics.capacity");
  const { capacity, capacityIsLoading } = useProjectCapacity(projectId);

  if (capacityIsLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-36" />
      </div>
    );
  }

  if (!capacity) return null;

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{t("totalCapacity")}</span>
        <span className="font-medium">{capacity.totalCapacity}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{t("allocated")}</span>
        <span className="font-medium">{capacity.allocatedCapacity}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{t("remaining")}</span>
        <span className="font-medium">{capacity.remainingCapacity}</span>
      </div>
    </div>
  );
}
