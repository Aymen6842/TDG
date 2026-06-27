import {
  ProjectTaskInResponseType,
  ProjectTaskType,
  ProjectTaskComment,
} from "@/modules/projects/types/project-tasks";
import { castLabelToFrontend } from "@/modules/projects/types/cast-project-label";
import { resolveAttachmentUrl } from "@/modules/projects/utils/resolve-attachment-url";

export function castProjectTaskToFrontend(raw: ProjectTaskInResponseType): ProjectTaskType {
  const comments: ProjectTaskComment[] = (raw.comments || []).map((c) => ({
    id: c.id,
    content: c.content,
    authorId: c.authorId,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    likeCount: c.likeCount,
    likedByMe: c.likedByMe,
    mentions: c.mentions,
    likes: c.likes,
  }));

  return {
    id: raw.id,
    key: raw.key,
    title: raw.title,
    description: raw.description,
    type: raw.type,
    status: raw.status,
    statusType: raw.statusType,
    priority: raw.priority,
    storyPoints: raw.storyPoints,
    estimatedHours: raw.estimatedHours,
    actualHours: raw.actualHours,
    progressPercent: raw.progressPercent,
    dueDate: raw.dueDate,
    completedAt: raw.completedAt,
    displayOrder: raw.displayOrder,
    assigneeId: raw.assigneeId,
    reporterId: raw.reporterId,
    milestoneId: raw.milestoneId,
    epicId: raw.epicId,
    sprintId: raw.sprintId,
    parentTaskId: raw.parentTaskId,
    isFavorite: raw.isFavorite,
    archived: raw.archived,
    attachments: raw.attachments?.map((attachment) => ({
      ...attachment,
      file: resolveAttachmentUrl(attachment.file),
    })),
    comments,
    subtasks: raw.subtasks?.map((s) => ({
      id: s.id,
      key: s.key,
      title: s.title,
      type: s.type,
      status: s.status,
      priority: s.priority,
      displayOrder: s.displayOrder,
      assigneeId: s.assigneeId,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    })),
    subtasksCount: raw.subtasksCount,
    completedSubtasksCount: raw.completedSubtasksCount,
    labels: raw.labels
      ? raw.labels.map((l) => ({
          id: l.id,
          projectId: "",
          name: l.name,
          color: l.color,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      : undefined,
    taskDependenciesAsBlocked: raw.taskDependenciesAsBlocked
      ? raw.taskDependenciesAsBlocked.map((d) => ({
          id: d.id,
          blockingTaskId: d.blockingTaskId,
          blockedTaskId: d.blockedTaskId,
          dependencyType: d.dependencyType,
          createdAt: new Date(d.createdAt),
          updatedAt: new Date(d.updatedAt ?? d.createdAt),
        }))
      : undefined,
    taskDependenciesAsBlocking: raw.taskDependenciesAsBlocking
      ? raw.taskDependenciesAsBlocking.map((d) => ({
          id: d.id,
          blockingTaskId: d.blockingTaskId,
          blockedTaskId: d.blockedTaskId,
          dependencyType: d.dependencyType,
          createdAt: new Date(d.createdAt),
          updatedAt: new Date(d.updatedAt ?? d.createdAt),
        }))
      : undefined,
    projectId: raw.projectId,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}
