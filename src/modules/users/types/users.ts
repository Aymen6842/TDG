import { UserRoleOnFrontendSide, UserRoleOnBackendSide } from "@/modules/auth/types";

export interface UserType {
  id: string;
  image?: string;
  name: string;
  email: string;
  phone?: string;
  roles: UserRoleOnFrontendSide[];
  teams: { id: string; name: string }[];
  isOnline: boolean;

  timeWorkedInMinutes?: number;
  averageSessionTimeInMinutes?: number;
  averagePerformanceRating?: number;
  averageDailyMood?: number;
  workedProjects?: number;

  //notifications settings
  notificationsSettings: {
    emailNotifications: boolean;
    telegramNotifications: boolean;
    ntfyNotifications: boolean;
    telegramChatId: string | null;
  }

  //for now we don't use it
  performance?: number;

  createdAt: Date;
}

export interface UserInResponseType {
  id: string;
  image?: string;
  name: string;
  email: string;
  phone?: string;
  roles: UserRoleOnBackendSide[];
  teams: { id: string; name: string }[];
  online: boolean;

  timeWorkedInMinutes?: number;
  averageSessionTimeInMinutes?: number;
  averagePerformanceRating?: number;
  averageDailyMood?: number;

  //notifications settings;
  "": {
    "emailNotificationsEnabled": false,
    "telegramNotificationsEnabled": false,
    "ntfyNotificationsEnabled": false
  },
  notificationSettings: {
    telegramNotificationsEnabled: boolean;
    emailNotificationsEnabled: boolean;
    ntfyNotificationsEnabled: boolean;
  };

  telegramBot: {
    chatId: string | null;
  }

  ntfyIntegration: {
    topic: string | null;
  }

  progress?: number;
  workedProjects?: number;

  createdAt: string;
}
