// ─── Frontend Shape ───────────────────────────────────────────────────────────

export interface NotificationType {
  id: string;
  title: string;
  body: string;
  image?: string;
  createdAt: Date;
  isSeen?: boolean;
  url: string;
}

// ─── Backend Response Shape ───────────────────────────────────────────────────
// Matches backend ReceivedNotificationDto / PaginateReceivedNotificationsDto

export interface NotificationInResponseType {
  id: string;
  title: string;
  body: string;
  image?: string;
  createdAt: string;
  isSeen?: boolean;
  url: string;
}

// ─── Notification Settings ───────────────────────────────────────────────────
// Matches backend UserNotificationSettings model

export interface NotificationSettingsType {
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  telegramNotificationsEnabled: boolean;
  ntfyNotificationsEnabled: boolean;
}