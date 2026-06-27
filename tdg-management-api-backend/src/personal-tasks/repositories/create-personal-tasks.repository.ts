import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { CreatePersonalTaskDto } from '../dto/request/post/create-personal-task.dto';
import { Language } from '@prisma/client';
import { CreatePersonalTaskCommentDto } from '../dto/request/post/create-personal-task-comment.dto';

@Injectable()
export class CreatePersonalTasksRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  createPersonalTask(data: CreatePersonalTaskDto) {
    return this.prismaService.userTask.create({
      data: {
        archived: data.archived,
        userId: data.userId as string,
        parentTaskId: data.parentTaskId,
        isFavorite: data.isFavorite,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate,
        reminderDate: data.reminderDate,
        displayOrder: data.displayOrder,
        ...(data?.attachments && {
          attachments: {
            createMany: {
              data: data?.attachments.map((file) => ({ file })),
              skipDuplicates: true,
            },
          },
        }),
        content: {
          createMany: {
            data: [
              {
                title: data.content.title,
                description: data.content.description,
                details: data.content.details,
              },
            ],
          },
        },
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

  createPersonalTaskComment(data: CreatePersonalTaskCommentDto) {
    return this.prismaService.userTaskComment.create({
      data: {
        taskId: data.taskId,
        userId: data.userId as string,
        comment: data.comment,
      },
      select: {
        id: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
