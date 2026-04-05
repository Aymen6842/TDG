import { castRoleFromBackendToFrontend } from "@/modules/auth/utils/user-roles";
import { UserInResponseType, UserType } from "@/modules/users/types/users";

export function castToUserType(userInResponse: UserInResponseType): UserType {
  return {
    id: userInResponse.id,
    name: userInResponse.name,
    email: userInResponse.email,
    image:
      userInResponse.image && userInResponse.image != "null"
        ? `${process.env.BACKEND_ADDRESS}${userInResponse.image}`
        : undefined,
    teams: userInResponse.teams
      ? userInResponse.teams.map((team) => ({ id: team.id, name: team.name }))
      : [],
    isOnline: userInResponse.online ? true : false,
    roles: userInResponse.roles.map((role) => castRoleFromBackendToFrontend(role)), //userInResponse.roles.map((role) => castRoleFromBackendToFrontend(role)),
    phone: userInResponse.phone,

    notificationsSettings: {
      emailNotifications: userInResponse.notificationSettings ? userInResponse.notificationSettings.emailNotificationsEnabled : false,
      telegramNotifications: userInResponse.notificationSettings ? userInResponse.notificationSettings.telegramNotificationsEnabled : false,
      ntfyNotifications: userInResponse.notificationSettings ? userInResponse.notificationSettings.ntfyNotificationsEnabled : false,
      telegramChatId: userInResponse.telegramBot ? userInResponse.telegramBot.chatId : null
    },

    timeWorkedInMinutes: userInResponse.timeWorkedInMinutes
      ? Number(userInResponse.timeWorkedInMinutes)
      : undefined,
    averageSessionTimeInMinutes: userInResponse.averageSessionTimeInMinutes
      ? Number(userInResponse.averageSessionTimeInMinutes)
      : undefined,
    averagePerformanceRating: userInResponse.averagePerformanceRating
      ? Number(userInResponse.averagePerformanceRating)
      : undefined,
    averageDailyMood: userInResponse.averageDailyMood
      ? Number(userInResponse.averageDailyMood)
      : undefined,

    workedProjects: userInResponse.workedProjects
      ? Number(userInResponse.workedProjects)
      : undefined,

    createdAt: new Date(userInResponse.createdAt)
  };
}
