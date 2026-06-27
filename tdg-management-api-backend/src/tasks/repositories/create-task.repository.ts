import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { CreateTaskDto } from '../dto/request/post/create-task.dto';

@Injectable()
export class CreateTaskRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  private async generateTaskKey(projectId: string): Promise<string> {
    const result = await this.prismaService.$transaction(async (tx) => {
      const count = await tx.task.count({
        where: { projectId },
      });
      return count + 1;
    });

    return `TASK-${result}`;
  }

  async createTask(data: {
    dto: CreateTaskDto;
    projectId: string;
    reporterId: string;
  }) {
    const key = await this.generateTaskKey(data.projectId);

    return this.prismaService.task.create({
      data: {
        projectId: data.projectId,
        reporterId: data.reporterId,
        key,
        title: data.dto.title,
        description: data.dto.description ?? null,
        type: data.dto.type,
        priority: data.dto.priority,
        status: data.dto.status,
        assigneeId: data.dto.assigneeId ?? null,
        sprintId: data.dto.sprintId ?? null,
        epicId: data.dto.epicId ?? null,
        milestoneId: data.dto.milestoneId ?? null,
        parentTaskId: data.dto.parentTaskId ?? null,
        storyPoints: data.dto.storyPoints ?? null,
        estimatedHours: data.dto.estimatedHours ?? null,
        progressPercent: data.dto.progressPercent ?? null,
        dueDate: data.dto.dueDate ? new Date(data.dto.dueDate) : null,
        displayOrder: data.dto.displayOrder ?? 0,
        isFavorite: data.dto.isFavorite ?? false,
        archived: data.dto.archived ?? false,
        ...(data.dto.attachments && data.dto.attachments.length > 0
          ? {
              attachments: {
                create: data.dto.attachments.map((a) => ({
                  file: a.file,
                })),
              },
            }
          : {}),
      },
      select: {
        id: true,
        projectId: true,
        key: true,
        title: true,
        description: true,
        type: true,
        priority: true,
        status: true,
        assigneeId: true,
        sprintId: true,
        epicId: true,
        milestoneId: true,
        parentTaskId: true,
        storyPoints: true,
        estimatedHours: true,
        progressPercent: true,
        dueDate: true,
        displayOrder: true,
        isFavorite: true,
        archived: true,
        createdAt: true,
        updatedAt: true,
        reporterId: true,
      },
    });
  }

  async addComment(data: {
    taskId: string;
    authorId: string;
    content: string;
    mentions?: string[];
  }) {
    return this.prismaService.$transaction(async (tx) => {
      const newComment = await tx.taskComment.create({
        data: {
          taskId: data.taskId,
          authorId: data.authorId,
          content: data.content,
        },
        select: {
          id: true,
          taskId: true,
          authorId: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (data.mentions && data.mentions.length > 0) {
        await tx.taskCommentMention.createMany({
          data: data.mentions.map((userId) => ({
            commentId: newComment.id,
            userId,
          })),
        });
      }

      return newComment;
    });
  }

  addTimeEntry(data: {
    taskId: string;
    userId: string;
    hours: number;
    description?: string;
    workSessionId?: string;
  }) {
    return this.prismaService.taskTimeEntry.create({
      data: {
        taskId: data.taskId,
        userId: data.userId,
        hours: data.hours,
        description: data.description ?? null,
        workSessionId: data.workSessionId ?? null,
      },
      select: {
        id: true,
        taskId: true,
        userId: true,
        workSessionId: true,
        hours: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
