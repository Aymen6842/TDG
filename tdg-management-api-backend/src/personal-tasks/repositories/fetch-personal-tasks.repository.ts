import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { FilterPersonalTasksParametersDto } from '../dto/request/fetch/filter-personal-tasks-parameters.dto';
import { Language } from '@prisma/client';
import { PersonalTasksSortByOptions } from '../types/request.type';

@Injectable()
export class FetchPersonalTasksRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  filterPersonalTasks(userId: string, data: FilterPersonalTasksParametersDto) {
    return this.prismaService.userTask.findMany({
      where: {
        ...(data.archived !== undefined && { archived: data.archived }),
        ...(data.isFavorite !== undefined && { isFavorite: data.isFavorite }),
        ...(data.statuses && { status: { in: data.statuses } }),
        ...(data.priorities && { priority: { in: data.priorities } }),
        userId: userId,
      },
      orderBy: [
        data.sortBy?.includes(PersonalTasksSortByOptions.DisplayOrderAsc)
          ? { displayOrder: 'asc' }
          : {},
        data.sortBy?.includes(PersonalTasksSortByOptions.DisplayOrderDesc)
          ? { displayOrder: 'desc' }
          : {},
        data.sortBy?.includes(PersonalTasksSortByOptions.DueDateAsc)
          ? { dueDate: 'asc' }
          : {},
        data.sortBy?.includes(PersonalTasksSortByOptions.DueDateDesc)
          ? { dueDate: 'desc' }
          : {},
        data.sortBy?.includes(PersonalTasksSortByOptions.PriorityAsc)
          ? { priority: 'asc' }
          : {},
        data.sortBy?.includes(PersonalTasksSortByOptions.PriorityDesc)
          ? { priority: 'desc' }
          : {},
        data.sortBy?.includes(PersonalTasksSortByOptions.StatusAsc)
          ? { status: 'asc' }
          : {},
        data.sortBy?.includes(PersonalTasksSortByOptions.StatusDesc)
          ? { status: 'desc' }
          : {},
        data.sortBy?.includes(PersonalTasksSortByOptions.CreatedAtAsc)
          ? { createdAt: 'asc' }
          : {},
        data.sortBy?.includes(PersonalTasksSortByOptions.CreatedAtDesc)
          ? { createdAt: 'desc' }
          : {},
        { displayOrder: 'asc' },
      ],
      select: {
        id: true,
        content: {
          where: { language: Language.English },
          select: {
            title: true,
            description: true,
            details: true,
          },
        },
        attachments: {
          select: {
            file: true,
          },
        },
        archived: true,
        parentTaskId: true,
        isFavorite: true,
        status: true,
        priority: true,
        dueDate: true,
        reminderDate: true,
        displayOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  getPersonalTaskById(id: string, userId: string) {
    return this.prismaService.userTask.findUniqueOrThrow({
      where: {
        id: id,
        userId: userId,
      },
      select: {
        id: true,
        content: {
          where: { language: Language.English },
          select: {
            title: true,
            description: true,
            details: true,
          },
        },
        subTasks: {
          select: {
            id: true,
            status: true,
            priority: true,
            content: {
              where: { language: Language.English },
              select: {
                title: true,
                description: true,
                details: true,
              },
            },
            attachments: {
              select: {
                file: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
        },
        attachments: {
          select: {
            file: true,
          },
        },
        comments: {
          select: {
            id: true,
            comment: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        archived: true,
        parentTaskId: true,
        isFavorite: true,
        status: true,
        priority: true,
        dueDate: true,
        reminderDate: true,
        displayOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  getPersonalTaskAttachmentsByPersonalTaskId(id: string, userId: string) {
    return this.prismaService.userTaskAttachment.findMany({
      where: { taskId: id, task: { userId: userId } },
      select: {
        file: true,
      },
    });
  }

  getPersonalTaskUsersStillNotNotified(currentTime: string) {
    return this.prismaService.userTask.findMany({
      where: { notified: false, reminderDate: { not: null, lte: currentTime } },
      select: {
        id: true,
        reminderDate: true,
        dueDate: true,
        content: {
          where: { language: Language.English },
          select: {
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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
        },
      },
    });
  }
}
