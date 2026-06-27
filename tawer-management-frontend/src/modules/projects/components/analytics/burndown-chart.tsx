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
import useSprintBurndown from "@/modules/projects/hooks/analytics/use-sprint-burndown";

interface Props {
  sprintId: string;
}

export default function BurndownChart({ sprintId }: Props) {
  const { burndownData, burndownIsLoading } = useSprintBurndown(sprintId);

  if (burndownIsLoading) {
    return <Skeleton className="h-[300px] w-full rounded-md" />;
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
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
