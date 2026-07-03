"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import useProjectVelocity from "@/modules/projects/hooks/analytics/use-project-velocity";

interface Props {
  projectId: string;
}

export default function VelocityChart({ projectId }: Props) {
  const { velocityData, velocityIsLoading } = useProjectVelocity(projectId);

  if (velocityIsLoading) {
    return <div className="h-[300px] w-full animate-pulse rounded-md bg-accent" />;
  }

  if (velocityData.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground text-center px-6">
          No completed sprints yet
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={velocityData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="sprintName" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="completedPoints" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
