import { Injectable } from '@nestjs/common';
import { SortUserBy } from '../types/request.type';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { UserDataInDb } from '../types/user.type';
import { TimeService } from 'src/common/time/service/time.service';
import { UserType } from '@prisma/client';
import { FilterUsersDto } from '../dto/request/fetch/filter-users-parameters.dto';

@Injectable()
export class FetchUserRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  getAllEmailsByRoles(roles: UserType[]) {
    return this.prismaService.user.findMany({
      where: {
        roles: { some: { type: { in: roles } } },
      },
      select: { email: true },
    });
  }

  getAllUsersWithNotificationsSettings() {
    return this.prismaService.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        telegramBot: {
          select: {
            chatId: true,
          },
        },
        ntfyIntegration: {
          select: {
            topic: true,
          },
        },
        notificationSettings: {
          select: {
            pushNotificationsEnabled: true,
            emailNotificationsEnabled: true,
            telegramNotificationsEnabled: true,
            ntfyNotificationsEnabled: true,
          },
        },
      },
    });
  }

  getUsersWithNotificationsSettingsByRoles(roles: UserType[]) {
    return this.prismaService.user.findMany({
      where: {
        roles: { some: { type: { in: roles } } },
      },
      select: {
        id: true,
        email: true,
        name: true,
        telegramBot: {
          select: {
            chatId: true,
          },
        },
        ntfyIntegration: {
          select: {
            topic: true,
          },
        },
        notificationSettings: {
          select: {
            pushNotificationsEnabled: true,
            emailNotificationsEnabled: true,
            telegramNotificationsEnabled: true,
            ntfyNotificationsEnabled: true,
          },
        },
      },
    });
  }

  getUserWithNotificationsSettingsById(id: string) {
    return this.prismaService.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        name: true,
        telegramBot: {
          select: {
            chatId: true,
          },
        },
        ntfyIntegration: {
          select: {
            topic: true,
          },
        },
        notificationSettings: {
          select: {
            pushNotificationsEnabled: true,
            emailNotificationsEnabled: true,
            telegramNotificationsEnabled: true,
            ntfyNotificationsEnabled: true,
          },
        },
      },
    });
  }

  getAllEmails() {
    return this.prismaService.user.findMany({
      select: { email: true },
    });
  }

  getEmailsByEmails(emails: string[]) {
    return this.prismaService.user.findMany({
      where: {
        email: { in: emails },
      },
      select: { email: true },
    });
  }

  getUserDetailsById(id: string): Promise<UserDataInDb[]> {
    return this.prismaService.$queryRawUnsafe(`
      SELECT
        "User"."id",
        "User"."email",
        "User"."phone",
        "User"."name",
        "User"."image",
        BOOL_OR(WorkSessions."id" IS NOT NULL AND WorkSessions."endTime" IS NULL) AS "online",
        BOOL_OR(WorkDays."dailyMood" IS NOT NULL AND WorkDays."createdAt"::date = CURRENT_DATE) AS "dailyMoodSumbmittedToday",

        COALESCE(
          JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT(
            'type', Role."type"
          )) FILTER (WHERE Role."type" IS NOT NULL),
          '[]'::jsonb
        ) AS "roles",

        COALESCE(
          JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT(
            'id', Team."id",
            'name', Team."name"
          )) FILTER (WHERE Team."id" IS NOT NULL),
          '[]'::jsonb
        ) AS "teams",

        JSONB_BUILD_OBJECT(
          'emailNotificationsEnabled', UserNotificationSettings."emailNotificationsEnabled",
          'telegramNotificationsEnabled', UserNotificationSettings."telegramNotificationsEnabled",
          'ntfyNotificationsEnabled', UserNotificationSettings."ntfyNotificationsEnabled"
        ) AS "notificationSettings",
        JSONB_BUILD_OBJECT(
          'chatId', UserTelegramBot."chatId"
        ) AS "telegramBot",
        JSONB_BUILD_OBJECT(
          'topic', UserNtfyIntegration."topic"
        ) AS "ntfyIntegration",

        COALESCE(SUM(DISTINCT WorkSessions."timeSpentInMinutes"), 0) AS "timeWorkedInMinutes",
        COALESCE(AVG(DISTINCT WorkSessions."timeSpentInMinutes"), 0) AS "averageSessionTimeInMinutes",
        COALESCE(AVG(DISTINCT WorkDays."dailyMood"), 0) AS "averageDailyMood",

        "User"."createdAt",
        "User"."updatedAt"

      FROM "User"
      LEFT JOIN "UserNotificationSettings" UserNotificationSettings ON UserNotificationSettings."userId" = "User"."id"
      LEFT JOIN "UserTelegramBot" UserTelegramBot ON UserTelegramBot."userId" = "User"."id"
      LEFT JOIN "UserNtfyIntegration" UserNtfyIntegration ON UserNtfyIntegration."userId" = "User"."id"
      LEFT JOIN "Role" Role ON Role."userId" = "User"."id"
      LEFT JOIN "WorkDay" WorkDays ON WorkDays."userId" = "User"."id"
      LEFT JOIN "WorkSession" WorkSessions ON WorkSessions."workDayId" = WorkDays."id"
      LEFT JOIN "UserTeam"  ON "UserTeam"."userId" = "User"."id"
      LEFT JOIN "Team" Team ON Team."id" = "UserTeam"."teamId"

      WHERE "User"."id" = '${id}'

      GROUP BY "User"."id", "notificationSettings", "telegramBot", "ntfyIntegration"
    `);
  }

  getUserPassword(id: string) {
    return this.prismaService.user.findUnique({
      where: { id: id },
      select: { password: true },
    });
  }

  countUsers(data: FilterUsersDto): Promise<{ countedUsers: number }[]> {
    return this.prismaService.$queryRawUnsafe(`
        SELECT COUNT(DISTINCT "User"."id")::INT AS "countedUsers"

        FROM "User"
        ${
          data.roles && data.roles?.length > 0
            ? 'LEFT JOIN "Role" Role ON Role."userId" = "User"."id"'
            : ''
        }
        ${
          data.teamsIds && data.teamsIds.length > 0
            ? ` LEFT JOIN "UserTeam" UserTeam ON UserTeam."userId" = "User"."id"`
            : ''
        }
        ${
          data.email
            ? `WHERE (
              "User"."email" ILIKE '${data.email}%'
              OR "User"."email" ILIKE '%${data.email}%'
            )
            `
            : 'WHERE 1 = 1'
        }
        ${
          data.usersIds && data.usersIds.length > 0
            ? `AND "User"."id" IN (${data.usersIds
                .map((id) => `'${id}'`)
                .join(',')})`
            : ''
        }
        ${
          data.teamsIds && data.teamsIds.length > 0
            ? `AND UserTeam."teamId" IN (${data.teamsIds
                .map((id) => `'${id}'`)
                .join(',')})`
            : ''
        }

        ${
          data.phone
            ? `AND (
              "User"."phone" ILIKE '${data.phone}%'
              OR "User"."phone" ILIKE '%${data.phone}%'
            )
            `
            : ''
        }
        ${
          data.roles &&
          data.roles?.some((role) => Object.values(UserType).includes(role))
            ? `AND (Role."type" IN (${data.roles?.map((role) => `'${role}'`).join(',')}) OR Role."type" IS NULL)`
            : ''
        }
        ${
          data.name
            ? `AND
                (
                  "User"."unaccentedName" ILIKE '${data.name}%'
                  OR "User"."unaccentedName" ILIKE '%${data.name}%'
                )
              `
            : ''
        }
        ${
          data.userCreatedAtFrom && TimeService.isUTC(data.userCreatedAtFrom)
            ? `AND "User"."createdAt" >= '${data.userCreatedAtFrom}'`
            : ''
        }
        ${
          data.userCreatedAtTo && TimeService.isUTC(data.userCreatedAtTo)
            ? `AND "User"."createdAt" <= '${data.userCreatedAtTo}'`
            : ''
        }

    `);
  }

  filterUsers(
    data: FilterUsersDto,
    skip?: number,
    limit?: number,
  ): Promise<UserDataInDb[]> {
    return this.prismaService.$queryRawUnsafe(`
      SELECT
        "User"."id",
        "User"."email",
        "User"."phone",
        "User"."name",
        "User"."image",
        BOOL_OR(WorkSessions."id" IS NOT NULL AND WorkSessions."endTime" IS NULL) AS "online",
        BOOL_OR(WorkDays."dailyMood" IS NOT NULL AND WorkDays."createdAt"::date = CURRENT_DATE) AS "dailyMoodSumbmittedToday",

        COALESCE(
          JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT(
            'type', Role."type"
          )) FILTER (WHERE Role."type" IS NOT NULL),
          '[]'::jsonb
        ) AS "roles",

        COALESCE(
          JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT(
            'id', Team."id",
            'name', Team."name"
          )) FILTER (WHERE Team."id" IS NOT NULL),
          '[]'::jsonb
        ) AS "teams",

        JSONB_BUILD_OBJECT(
          'emailNotificationsEnabled', UserNotificationSettings."emailNotificationsEnabled",
          'telegramNotificationsEnabled', UserNotificationSettings."telegramNotificationsEnabled",
          'ntfyNotificationsEnabled', UserNotificationSettings."ntfyNotificationsEnabled"
        ) AS "notificationSettings",
        JSONB_BUILD_OBJECT(
          'chatId', UserTelegramBot."chatId"
        ) AS "telegramBot",
        JSONB_BUILD_OBJECT(
          'topic', UserNtfyIntegration."topic"
        ) AS "ntfyIntegration",

        COALESCE(SUM(DISTINCT WorkSessions."timeSpentInMinutes"), 0) AS "timeWorkedInMinutes",
        COALESCE(AVG(DISTINCT WorkSessions."timeSpentInMinutes"), 0) AS "averageSessionTimeInMinutes",
        COALESCE(AVG(DISTINCT WorkDays."performanceRating"), 0) AS "averagePerformanceRating",
        COALESCE(AVG(DISTINCT WorkDays."dailyMood"), 0) AS "averageDailyMood",

        "User"."createdAt",
        "User"."updatedAt"

      FROM "User"
      LEFT JOIN "UserNotificationSettings" UserNotificationSettings ON UserNotificationSettings."userId" = "User"."id"
      LEFT JOIN "UserTelegramBot" UserTelegramBot ON UserTelegramBot."userId" = "User"."id"
      LEFT JOIN "UserNtfyIntegration" UserNtfyIntegration ON UserNtfyIntegration."userId" = "User"."id"
      LEFT JOIN "Role" Role ON Role."userId" = "User"."id"
      LEFT JOIN "WorkDay" WorkDays ON WorkDays."userId" = "User"."id"
      LEFT JOIN "WorkSession" WorkSessions ON WorkSessions."workDayId" = WorkDays."id"
      LEFT JOIN "UserTeam"  ON "UserTeam"."userId" = "User"."id"
      LEFT JOIN "Team" Team ON Team."id" = "UserTeam"."teamId"

      ${
        data.teamsIds && data.teamsIds.length > 0
          ? ` LEFT JOIN "UserTeam" UserTeam ON UserTeam."userId" = "User"."id"`
          : ''
      }
      ${
        data.email
          ? `WHERE (
            "User"."email" ILIKE '${data.email}%'
            OR "User"."email" ILIKE '%${data.email}%'
          )
          `
          : 'WHERE 1 = 1'
      }
      ${
        data.usersIds && data.usersIds.length > 0
          ? `AND "User"."id" IN (${data.usersIds
              .map((id) => `'${id}'`)
              .join(',')})`
          : ''
      }
      ${
        data.teamsIds && data.teamsIds.length > 0
          ? `AND UserTeam."teamId" IN (${data.teamsIds
              .map((id) => `'${id}'`)
              .join(',')})`
          : ''
      }

      ${
        data.phone
          ? `AND (
            "User"."phone" ILIKE '${data.phone}%'
            OR "User"."phone" ILIKE '%${data.phone}%'
          )
          `
          : ''
      }
      ${
        data.roles &&
        data.roles?.some((role) => Object.values(UserType).includes(role))
          ? `AND (Role."type" IN (${data.roles?.map((role) => `'${role}'`).join(',')}) OR Role."type" IS NULL)`
          : ''
      }
      ${
        data.name
          ? `AND
              (
                "User"."unaccentedName" ILIKE '${data.name}%'
                OR "User"."unaccentedName" ILIKE '%${data.name}%'
              )
            `
          : ''
      }
      ${
        data.userCreatedAtFrom && TimeService.isUTC(data.userCreatedAtFrom)
          ? `AND "User"."createdAt" >= '${data.userCreatedAtFrom}'`
          : ''
      }
      ${
        data.userCreatedAtTo && TimeService.isUTC(data.userCreatedAtTo)
          ? `AND "User"."createdAt" <= '${data.userCreatedAtTo}'`
          : ''
      }


      GROUP BY "User"."id", "notificationSettings", "telegramBot", "ntfyIntegration"

      ORDER BY ${
        data.name
          ? `CASE WHEN "User"."unaccentedName" ILIKE '${data.name}%'
            THEN 0 ELSE 1 END,`
          : ''
      }
      ${
        data.phone
          ? `CASE WHEN "User"."phone" ILIKE '${data.phone}%'
            THEN 0 ELSE 1 END,`
          : ''
      }
      ${
        data.sortBy === SortUserBy.createdAtAsc
          ? `"User"."createdAt" ASC`
          : data.sortBy === SortUserBy.createdAtDesc
            ? `"User"."createdAt" DESC`
            : data.sortBy === SortUserBy.emailAsc
              ? `"User"."email" ASC`
              : data.sortBy === SortUserBy.emailDesc
                ? `"User"."email" DESC`
                : data.sortBy === SortUserBy.nameAsc
                  ? `"User"."name" ASC`
                  : data.sortBy === SortUserBy.nameDesc
                    ? `"User"."name" DESC`
                    : `"User"."createdAt" DESC`
      }

      ${limit ? `LIMIT ${limit}` : ''}
      ${skip ? `OFFSET ${skip}` : ''}
    `);
  }

  getAllUsersForEvent() {
    return this.prismaService.user.findMany({
      select: {
        id: true,
      },
    });
  }
}
