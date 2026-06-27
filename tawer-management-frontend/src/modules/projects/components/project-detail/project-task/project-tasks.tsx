"use client";
import React from "react";
import ProjectTasksList from "./project-tasks-list";
import { ProjectType } from "../../../types/projects";

interface Props {
  project: ProjectType;
}

export default function ProjectTasks({ project }: Props) {
  return <ProjectTasksList project={project} />;
}
