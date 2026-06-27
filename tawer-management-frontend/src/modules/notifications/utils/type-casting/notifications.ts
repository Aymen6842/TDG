import { NotificationInResponseType, NotificationType } from "@/modules/notifications/types";

export function castToNotificationType(
  notificationInResponse: NotificationInResponseType
): NotificationType {
  return {
    id: notificationInResponse.id,
    title: notificationInResponse.title || "",
    body: notificationInResponse.body,
    image: notificationInResponse.image
      ? `${process.env.BACKEND_ADDRESS}${notificationInResponse.image}`
      : "/logo.png",
    url: notificationInResponse.url,
    isSeen: notificationInResponse.isSeen,
    createdAt: new Date(notificationInResponse.createdAt)
  };
}
