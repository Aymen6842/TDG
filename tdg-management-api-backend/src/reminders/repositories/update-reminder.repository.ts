import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { ReminderStatus } from '@prisma/client';
import { UpdateReminderDto } from '../dto/request/update/update-reminder.dto';

@Injectable()
export class UpdateReminderRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  private toDate(value?: Date): Date | undefined {
    return value ? new Date(value) : undefined;
  }

  update(data: {
    reminderId: string;
    projectId?: string | null;
    dto: UpdateReminderDto;
  }) {
    return this.prismaService.reminder.update({
      where: {
        id: data.reminderId,
        ...(data.projectId ? { projectId: data.projectId } : {}),
      },
      data: {
        ...(data.dto.message !== undefined && { message: data.dto.message }),
        ...(data.dto.reminderAt !== undefined && {
          reminderAt: this.toDate(data.dto.reminderAt),
        }),
        ...(data.dto.isRecurring !== undefined && {
          isRecurring: data.dto.isRecurring,
        }),
        ...(data.dto.recurrenceRule !== undefined && {
          recurrenceRule: data.dto.recurrenceRule,
        }),
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

  markAsSent(data: { reminderId: string }) {
    return this.prismaService.reminder.update({
      where: { id: data.reminderId },
      data: {
        status: ReminderStatus.SENT,
        sentAt: new Date(),
      },
    });
  }

  markAsDismissed(data: { reminderId: string; userId: string }) {
    return this.prismaService.reminder.update({
      where: { id: data.reminderId, userId: data.userId },
      data: {
        status: ReminderStatus.DISMISSED,
        dismissedAt: new Date(),
      },
    });
  }
}
