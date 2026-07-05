"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import useSprintBurndown from "@/modules/projects/hooks/analytics/use-sprint-burndown";

interface Props {
  sprintId: string;
}

export default function BurndownChart({ sprintId }: Props) {
  const t = useTranslations("modules.projects.project.analytics.burndown");
  const { burndownData, burndownIsLoading } = useSprintBurndown(sprintId);

  if (burndownIsLoading) {
    return <Skeleton className="h-[300px] w-full rounded-md" />;
  }

  if (burndownData.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground text-center px-6">
          {t("noDatesYet")}
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={burndownData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="remainingPoints"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
