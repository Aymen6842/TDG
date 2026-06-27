import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { FilterWrokDaysParametersDto } from '../dto/request/fetch/filter-work-days-parameters.dto';
import { TimeService } from 'src/common/time/service/time.service';
import { FilterWorkDaysStatisticsParametersDto } from '../dto/request/fetch/filter-work-days-statistics-parameters.dto';
import { WorkSessionLocation } from '@prisma/client';

@Injectable()
export class FilterWorkSessionsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  getLastWorkSessionForWorkerByWorkerDayId(workDayId: string, userId: string) {
    return this.prismaService.workSession.findFirstOrThrow({
      where: { endTime: null, workDay: { id: workDayId, userId: userId } },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        timeSpentInMinutes: true,
        location: true,
        device: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  filterWorkDaysForManager(
    query: FilterWrokDaysParametersDto,
    skip: number,
    take: number,
  ) {
    return this.prismaService.workDay.findMany({
      where: {
        ...(query.usersIds && {
          userId: { in: query.usersIds },
        }),
        ...(query.location && {
          workSessions: {
            some: {
              location: query.location,
            },
          },
        }),
        ...(query.from && {
          createdAt: { gte: query.from },
        }),
        ...(query.to && {
          createdAt: { lte: query.to },
        }),
        ...(query.dailyMood !== undefined && {
          dailyMood: query.dailyMood,
        }),
        ...(query.performanceRating !== undefined && {
          performanceRating: query.performanceRating,
        }),
        ...(query.startTime && {
          workSessions: {
            some: {
              startTime: { gte: query.startTime },
            },
          },
        }),
        ...(query.endTime && {
          workSessions: {
            some: {
              endTime: { lte: query.endTime },
            },
          },
        }),
      },

      orderBy: { createdAt: 'desc' },

      select: {
        id: true,
        dailyMood: true,
        performanceRating: true,
        workerNotes: true,
        managerNotes: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            image: true,
          },
        },
        workSessions: {
          orderBy: { startTime: 'desc' },
          select: {
            startTime: true,
            endTime: true,
            timeSpentInMinutes: true,
            location: true,
            device: true,
          },
        },
      },

      skip,
      take,
    });
  }

  filterWorkDaysForUser(
    userId: string,
    query: FilterWrokDaysParametersDto,
    skip: number,
    take: number,
  ) {
    return this.prismaService.workDay.findMany({
      where: {
        userId,

        ...(query.location && {
          workSessions: {
            some: {
              location: query.location,
            },
          },
        }),

        ...(query.from && {
          createdAt: { gte: query.from },
        }),
        ...(query.to && {
          createdAt: { lte: query.to },
        }),
        ...(query.dailyMood !== undefined && {
          dailyMood: query.dailyMood,
        }),
        ...(query.startTime && {
          workSessions: {
            some: {
              startTime: { gte: query.startTime },
            },
          },
        }),
        ...(query.endTime && {
          workSessions: {
            some: {
              endTime: { lte: query.endTime },
            },
          },
        }),
      },

      orderBy: { createdAt: 'desc' },

      select: {
        id: true,
        dailyMood: true,
        workerNotes: true,
        workSessions: {
          orderBy: { startTime: 'desc' },
          select: {
            startTime: true,
            endTime: true,
            timeSpentInMinutes: true,
            location: true,
            device: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },

      skip,
      take,
    });
  }

  countFilteredWorkDaysForManager(query: FilterWrokDaysParametersDto) {
    return this.prismaService.workDay.count({
      where: {
        ...(query.usersIds && {
          userId: { in: query.usersIds },
        }),

        ...(query.location && {
          workSessions: {
            some: {
              location: query.location,
            },
          },
        }),

        ...(query.from && {
          createdAt: { gte: query.from },
        }),
        ...(query.to && {
          createdAt: { lte: query.to },
        }),

        ...(query.dailyMood !== undefined && {
          dailyMood: query.dailyMood,
        }),

        ...(query.performanceRating !== undefined && {
          performanceRating: query.performanceRating,
        }),

        ...(query.startTime && {
          workSessions: {
            some: {
              startTime: { gte: query.startTime },
            },
          },
        }),

        ...(query.endTime && {
          workSessions: {
            some: {
              endTime: { lte: query.endTime },
            },
          },
        }),
      },
    });
  }

  countFilteredWorkDaysForUser(
    userId: string,
    query: FilterWrokDaysParametersDto,
  ) {
    return this.prismaService.workDay.count({
      where: {
        userId,

        ...(query.location && {
          workSessions: {
            some: {
              location: query.location,
            },
          },
        }),

        ...(query.from && {
          createdAt: { gte: query.from },
        }),

        ...(query.to && {
          createdAt: { lte: query.to },
        }),

        ...(query.dailyMood !== undefined && {
          dailyMood: query.dailyMood,
        }),

        ...(query.startTime && {
          workSessions: {
            some: {
              startTime: { gte: query.startTime },
            },
          },
        }),

        ...(query.endTime && {
          workSessions: {
            some: {
              endTime: { lte: query.endTime },
            },
          },
        }),
      },
    });
  }

  getCurrentWorkDayByUserIdForUser(userId: string) {
    return this.prismaService.workDay.findFirst({
      where: {
        userId: userId,
        createdAt: {
          gte: TimeService.getStartOfBusinessDayUTC(),
          lte: TimeService.getEndOfBusinessDayUTC(),
        },
      },
      select: {
        id: true,
        dailyMood: true,
        workerNotes: true,
        workSessions: {
          orderBy: { startTime: 'desc' },
          select: {
            startTime: true,
            endTime: true,
            timeSpentInMinutes: true,
            location: true,
            device: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  getWorkSessionWithNoEndTimeByWorkDayId(workDayId: string) {
    return this.prismaService.workSession.findFirst({
      where: {
        workDay: { id: workDayId },
        endTime: null,
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        timeSpentInMinutes: true,
        location: true,
        device: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  getWorkDayById(workDayId: string) {
    return this.prismaService.workDay.findUniqueOrThrow({
      where: { id: workDayId },
      select: {
        id: true,
        dailyMood: true,
        performanceRating: true,
        workerNotes: true,
        managerNotes: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            image: true,
          },
        },
        workSessions: {
          orderBy: { startTime: 'desc' },
          select: {
            startTime: true,
            endTime: true,
            timeSpentInMinutes: true,
            location: true,
            device: true,
          },
        },
      },
    });
  }

  filterWorkSessionsStatisticsOverviewBetweenDates(
    data: FilterWorkDaysStatisticsParametersDto,
  ) {
    return this.prismaService.workSession.aggregate({
      where: {
        workDay: {
          ...(data.from && { createdAt: { gte: data.from } }),
          ...(data.to && { createdAt: { lte: data.to } }),
          ...(data.usersIds && { userId: { in: data.usersIds } }),
          ...(data.teamIds && {
            user: {
              teams: {
                some: { teamId: { in: data.teamIds } },
              },
            },
          }),
        },
      },
      _count: { id: true },
      _sum: { timeSpentInMinutes: true },
      _avg: { timeSpentInMinutes: true },
      _min: { startTime: true },
      _max: { endTime: true },
    });
  }

  filterWorkDaysStatisticsOverviewBetweenDates(
    data: FilterWrokDaysParametersDto,
  ) {
    return this.prismaService.workDay.aggregate({
      where: {
        ...(data.from && { createdAt: { gte: data.from } }),
        ...(data.to && { createdAt: { lte: data.to } }),
        ...(data.usersIds && { userId: { in: data.usersIds } }),
        ...(data.location && {
          workSessions: {
            some: {
              location: data.location,
            },
          },
        }),
        ...(data.teamIds && {
          user: {
            teams: {
              some: { teamId: { in: data.teamIds } },
            },
          },
        }),
      },
      _avg: {
        dailyMood: true,
        performanceRating: true,
      },
    });
  }

  filterWorkDaysStatisticsDetailsBetweenDates(
    query: FilterWorkDaysStatisticsParametersDto,
  ): Promise<
    { date: Date; remoteWorkedHours: number; officeWorkedHours: number }[]
  > {
    return this.prismaService.$queryRawUnsafe(`
      WITH calendar AS (
        SELECT generate_series(
          DATE('${query.from}'),
          DATE('${query.to}'),
          '1 day'
        ) AS date
      )

      SELECT
        DATE(calendar."date") as date,
        COALESCE(SUM(CASE WHEN WorkSession."location" = '${WorkSessionLocation.REMOTE}' THEN WorkSession."timeSpentInMinutes" END) / 60.0, 0) AS "remoteWorkedHours",
        COALESCE(SUM(CASE WHEN WorkSession."location" = '${WorkSessionLocation.ONSITE}' THEN WorkSession."timeSpentInMinutes" END) / 60.0, 0) AS "officeWorkedHours"

      FROM calendar
      LEFT JOIN "WorkDay" WorkDay ON DATE(WorkDay."createdAt") = calendar."date"
      ${
        query.usersIds && query.usersIds.length > 0
          ? `AND WorkDay."userId" IN (${query.usersIds
              .map((id) => `'${id}'`)
              .join(',')})`
          : ''
      }
      LEFT JOIN "WorkSession" WorkSession ON WorkDay.id = WorkSession."workDayId"

      GROUP BY date
      ORDER BY date ASC;
    `);
  }

  getOpenWorkSessions() {
    return this.prismaService.workSession.findMany({
      where: { endTime: null },
      select: {
        id: true,
        startTime: true,
        location: true,
        device: true,
        workDay: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                notificationSettings: {
                  select: {
                    emailNotificationsEnabled: true,
                    telegramNotificationsEnabled: true,
                    ntfyNotificationsEnabled: true,
                    pushNotificationsEnabled: true,
                  },
                },
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
              },
            },
          },
        },
      },
    });
  }
}
