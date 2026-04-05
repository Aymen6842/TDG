import { TaskInResponseType, TaskType } from "../../types/tasks";

export function castToTaskType(taskInResponse: TaskInResponseType): TaskType {
  return {
    id: taskInResponse.id,
    title: taskInResponse.title,
    description: taskInResponse.description,
    details: taskInResponse.details,
    archived: taskInResponse.archived,
    isFavorite: taskInResponse.isFavorite,
    status: taskInResponse.status,
    priority: taskInResponse.priority,
    parentTaskId: taskInResponse.parentTaskId,
    attachments: taskInResponse.attachments,
    dueTime: new Date(taskInResponse.dueDate),
    reminderTime: new Date(taskInResponse.reminderDate),
    createdAt: taskInResponse.createdAt,
    updatedAt: taskInResponse.updatedAt
  };
}
