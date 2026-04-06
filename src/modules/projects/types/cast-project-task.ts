import {
  ProjectTaskInResponseType,
  ProjectTaskType,
  ProjectTaskComment,
  ProjectTaskSubTask,
} from "@/modules/projects/types/project-tasks";

export function castProjectTaskToFrontend(raw: ProjectTaskInResponseType): ProjectTaskType {
  const comments: ProjectTaskComment[] = (raw.comments || []).map((c) => ({
    id: c.id,
    comment: c.comment,
    authorId: c.authorId,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));

  const subTasks: ProjectTaskSubTask[] = (raw.subTasks || []).map((s) => ({
    id: s.id,
    key: s.key,
    title: s.title,
    status: s.status,
    priority: s.priority,
    assigneeId: s.assigneeId,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));

  return {
    id: raw.id,
    key: raw.key,
    title: raw.title,
    description: raw.description,
    type: raw.type,
    status: raw.status,
    priority: raw.priority,
    storyPoints: raw.storyPoints,
    dueDate: raw.dueDate,
    assigneeId: raw.assigneeId,
    milestoneId: raw.milestoneId,
    epicId: raw.epicId,
    sprintId: raw.sprintId,
    parentTaskId: raw.parentTaskId,
    attachments: raw.attachments,
    comments,
    subTasks,
    projectId: raw.projectId,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}
