"use client";
import React from "react";
import useProjectTasks from "@/modules/projects/hooks/tasks/use-project-tasks";
import useProjectSprints from "@/modules/projects/hooks/sprints/use-project-sprints";
import useMilestones from "@/modules/projects/hooks/milestones/use-milestones";
import { ReminderEntityType } from "@/modules/reminders/types/reminders";

interface Props {
  projectId: string;
  entityType: ReminderEntityType;
  entityId?: string | null;
}

/** Resolves a reminder's entityId to the linked task/sprint/milestone title. Falls back to the raw id. */
export default function ReminderEntityLabel({ projectId, entityType, entityId }: Props) {
  const { tasks } = useProjectTasks(entityType === "TASK" ? projectId : "");
  const { sprints } = useProjectSprints(entityType === "SPRINT" ? projectId : "");
  const { milestones } = useMilestones(entityType === "MILESTONE" ? projectId : "");

  if (!entityId) return null;

  let title: string | undefined;
  if (entityType === "TASK") title = tasks.find((t) => t.id === entityId)?.title;
  else if (entityType === "SPRINT") title = sprints.find((s) => s.id === entityId)?.name;
  else if (entityType === "MILESTONE") title = milestones.find((m) => m.id === entityId)?.name;

  return <>{title ?? entityId}</>;
}
