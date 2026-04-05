export interface NotificationType {
  id: string;
  title: string;
  description: string;
  image?: string;
  createdAt: Date;
  unread?: boolean;
  href: string; // The destination URL when clicked
}

export interface NotificationInResponseType {
  id: string;
  title: string;
  body: string;
  image?: string;
  createdAt: string;
  isSeen?: boolean;
  url: string; // The destination URL when clicked
}

export interface NotificationSettingsType {
  emailNotifications: boolean;
  telegramNotifications: boolean;
  ntfyNotifications: boolean;
  telegramChatId: string | null;
  ntfyTopic: string;
}