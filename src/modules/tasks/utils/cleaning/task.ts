import { formatDateToBackendFormat } from "@/utils/date";
import { TaskUpdateType } from "../../types/tasks";
import { TaskFormSchema } from "../../validation/task.shema";

export function cleanTaskDataToUpload(data: TaskFormSchema): FormData {
  const formData = new FormData();

  if (typeof data.archived === "boolean") {
    formData.append("archived", String(data.archived));
  }

  if (typeof data.isFavorite === "boolean") {
    formData.append("isFavorite", String(data.isFavorite));
  }

  if (data.parentTaskId) {
    formData.append("parentTaskId", data.parentTaskId);
  }

  if (data.status) {
    formData.append("status", data.status);
  }

  if (data.priority) {
    formData.append("priority", data.priority);
  }

  if (data.dueTime) {
    formData.append("dueDate", formatDateToBackendFormat(new Date(data.dueTime)));
  }

  if (data.reminderTime) {
    formData.append("reminderDate", formatDateToBackendFormat(new Date(data.reminderTime)));
  }

  // content
  formData.append(
    "content",
    JSON.stringify({
      title: data.title,
      description: data.description,
      details: data.details
    })
  );

  if (data.attachments?.length) {
    data.attachments.forEach((attachment) => {
      if (attachment instanceof File) {
        formData.append("attachments", attachment);
      }
    });
  }

  if (data.deletedAttachments) {
    const attachments = Array.isArray(data.deletedAttachments)
      ? data.deletedAttachments
      : [data.deletedAttachments];

    formData.append("deletedAttachments", JSON.stringify(attachments));
  }

  return formData;
}

export function cleanUpdatedTaskToUpload(updates: TaskUpdateType): FormData {
  const formData = new FormData();

  if (typeof updates.isFavorite === "boolean") {
    formData.append("isFavorite", String(updates.isFavorite));
  }

  if (updates.status) {
    formData.append("status", updates.status);
  }

  if (updates.priority) {
    formData.append("priority", updates.priority);
  }

  if (updates.displayOrder) formData.append("displayOrder", updates.displayOrder.toFixed());



  return formData;
}