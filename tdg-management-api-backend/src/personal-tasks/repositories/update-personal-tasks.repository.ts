import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { Language } from '@prisma/client';
import { UpdatePersonalTaskDto } from '../dto/request/update/update-personal-task.dto';

@Injectable()
export class UpdatePersonalTasksRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  updatePersonalTask(id: string, userId: string, data: UpdatePersonalTaskDto) {
    return this.prismaService.userTask.update({
      where: { id: id, userId: userId },
      data: {
        archived: data.archived,
        parentTaskId: data.parentTaskId,
        isFavorite: data.isFavorite,
        status: data.status,
        displayOrder: data.displayOrder,
        priority: data.priority,
        dueDate: data.dueDate,
        reminderDate: data.reminderDate,
        ...(data.reminderDate && { notified: false }),
        ...(data?.attachments && {
          attachments: {
            createMany: {
              data: data?.attachments.map((file) => ({ file })),
              skipDuplicates: true,
            },
            deleteMany: {
              file: { in: data.deletedAttachments || [] },
            },
          },
        }),
        ...(data?.content && {
          content: {
            upsert: {
              where: {
                taskId_language: { taskId: id, language: Language.English },
              },
              create: {
                title: data?.content?.title as string,
                description: data?.content?.description,
                details: data?.content?.details,
              },
              update: {
                title: data?.content?.title as string,
                description: data?.content?.description,
                details: data?.content?.details,
              },
            },
          },
        }),
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
        createdAt: true,
        updatedAt: true,
        displayOrder: true,
      },
    });
  }

  updatePersonalTaskNotificationStatus(
    id: string,
    userId: string,
    notified: boolean,
  ) {
    return this.prismaService.userTask.update({
      where: { id: id, userId: userId },
      data: { notified: notified },
    });
  }
}
