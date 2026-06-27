import { UserType } from '@prisma/client';

export interface UserDataInDb {
  id: string;
  email: string | null;
  phone: string | null;
  image: string | null;
  name: string | null;
  roles: { type: UserType }[];
  teams: { team: { id: string; name: string } }[];
  telegramBot?: { chatId: string | null } | null;
  ntfyIntegration?: { topic: string | null } | null;
  notificationSettings?: {
    emailNotificationsEnabled: boolean;
    pushNotificationsEnabled: boolean;
    telegramNotificationsEnabled: boolean;
    ntfyNotificationsEnabled: boolean;
  } | null;
  timeWorkedInMinutes?: number;
  averageSessionTimeInMinutes?: number;
  averagePerformanceRating?: number;
  averageDailyMood?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
