import { TaskDetailsInResponseType, TaskDetailsType } from "../../types/tasks";

export function castToTaskDetailsType(taskDetailsInResponse: TaskDetailsInResponseType): TaskDetailsType {
  return {
    id: taskDetailsInResponse.id,
    title: taskDetailsInResponse.title,
    description: taskDetailsInResponse.description,
    details: taskDetailsInResponse.details,
    archived: taskDetailsInResponse.archived,
    isFavorite: taskDetailsInResponse.isFavorite,
    status: taskDetailsInResponse.status,
    priority: taskDetailsInResponse.priority,
    parentTaskId: taskDetailsInResponse.parentTaskId,
    attachments: taskDetailsInResponse.attachments?.map(attachment =>
      `${process.env.BACKEND_ADDRESS || ''}${attachment}`
    ),
    comments: taskDetailsInResponse.comments,
    subTasks: taskDetailsInResponse.subTasks,
    dueTime: (new Date(taskDetailsInResponse.dueDate)),
    reminderTime: new Date(taskDetailsInResponse.reminderDate),
    createdAt: taskDetailsInResponse.createdAt,
    updatedAt: taskDetailsInResponse.updatedAt
  };
}
