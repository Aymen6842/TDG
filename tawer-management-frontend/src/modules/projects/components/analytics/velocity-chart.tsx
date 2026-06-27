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

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={velocityData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="sprintName" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="completedPoints" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
