import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { FilterEventsParamsDto } from '../dto/request/fetch/filter-events-params.dto';

@Injectable()
export class FetchEventRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async fetchEventsByPeriod(query: FilterEventsParamsDto) {
    return await this.prismaService.event.findMany({
      where: {
        AND: [
          ...(query.eventType ? [{ type: query.eventType }] : []),
          {
            startTime: {
              gte: query.from,
              lte: query.to,
            },
          },
          {
            OR: [
              { toAllUsers: true },
              { createdById: query.createdById },
              {
                participants: {
                  some: {
                    userId: query.createdById,
                  },
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        type: true,
        content: {
          select: {
            title: true,
            description: true,
          },
        },
        color: true,
        startTime: true,
        endTime: true,
        location: true,
        toAllUsers: true,
        isNotified: true,
        nextNotificationTime: true,
        createdAt: true,
        updatedAt: true,
        createdById: true,
        participants: true,
      },
    });
  }

  async getEventById(id: string) {
    return await this.prismaService.event.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        type: true,
        content: {
          select: {
            title: true,
            description: true,
          },
        },
        color: true,
        startTime: true,
        endTime: true,
        location: true,
        toAllUsers: true,
        isNotified: true,
        nextNotificationTime: true,
        createdAt: true,
        updatedAt: true,
        createdById: true,
        participants: {
          select: {
            userId: true,
          },
        },
      },
    });
  }

  fetchNextEventsToNotify(now: string) {
    return this.prismaService.event.findMany({
      where: {
        isNotified: false,
        nextNotificationTime: {
          lte: now,
        },
        startTime: {
          gt: now,
        },
      },
      select: {
        id: true,
        type: true,
        createdById: true,
        startTime: true,
        toAllUsers: true,
        createdBy: {
          select: {
            email: true,
            name: true,
            notificationSettings: {
              select: {
                emailNotificationsEnabled: true,
                pushNotificationsEnabled: true,
                telegramNotificationsEnabled: true,
                ntfyNotificationsEnabled: true,
              },
            },
            telegramBot: {
              select: { chatId: true },
            },
            ntfyIntegration: {
              select: {
                topic: true,
              },
            },
          },
        },
        participants: {
          select: {
            user: {
              select: {
                email: true,
                name: true,
                notificationSettings: {
                  select: {
                    emailNotificationsEnabled: true,
                    pushNotificationsEnabled: true,
                    telegramNotificationsEnabled: true,
                    ntfyNotificationsEnabled: true,
                  },
                },
                telegramBot: {
                  select: { chatId: true },
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
        content: {
          select: {
            title: true,
            description: true,
          },
        },
      },
    });
  }
}
