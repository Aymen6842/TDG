import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { ChannelType, ReminderEntityType } from '@prisma/client';
import { CreateReminderDto } from '../dto/request/post/create-reminder.dto';

@Injectable()
export class CreateReminderRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  createReminder(
    data: CreateReminderDto & {
      projectId: string;
      createdById: string;
      entityType: ReminderEntityType;
      channels?: ChannelType[];
    },
  ) {
    return this.prismaService.reminder.create({
      data: {
        userId: data.userId,
        entityType: data.entityType,
        entityId: data.entityId,
        projectId: data.projectId,
        message: data.message,
        reminderAt: data.reminderAt,
        isRecurring: data.isRecurring,
        recurrenceRule: data.recurrenceRule,
        createdById: data.createdById,
        channels: data.channels
          ? {
              create: data.channels.map((channel) => ({ channel })),
            }
          : undefined,
      },
      select: {
        id: true,
        userId: true,
        entityType: true,
        entityId: true,
        projectId: true,
        taskId: true,
        milestoneId: true,
        message: true,
        reminderAt: true,
        isRecurring: true,
        recurrenceRule: true,
        createdById: true,
        status: true,
        sentAt: true,
        dismissedAt: true,
        createdAt: true,
        updatedAt: true,
        channels: {
          select: {
            id: true,
            channel: true,
          },
        },
      },
    });
  }
}
