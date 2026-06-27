import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { UpdateTaskDto } from '../dto/request/update/update-task.dto';

@Injectable()
export class UpdateTaskRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  updateTask(data: { taskId: string; dto: UpdateTaskDto }) {
    const updateData: Prisma.TaskUncheckedUpdateInput = {};

    if (data.dto.title !== undefined) {
      updateData.title = data.dto.title;
    }

    if (data.dto.description !== undefined) {
      updateData.description = data.dto.description;
    }

    if (data.dto.type !== undefined) {
      updateData.type = data.dto.type;
    }

    if (data.dto.priority !== undefined) {
      updateData.priority = data.dto.priority;
    }

    if (data.dto.status !== undefined) {
      updateData.status = data.dto.status;
      if (data.dto.status === 'DONE') {
        updateData.completedAt = new Date();
      }
    }

    if (data.dto.assigneeId !== undefined) {
      updateData.assigneeId = data.dto.assigneeId;
    }

    if (data.dto.sprintId !== undefined) {
      updateData.sprintId = data.dto.sprintId;
    }

    if (data.dto.epicId !== undefined) {
      updateData.epicId = data.dto.epicId;
    }

    if (data.dto.parentTaskId !== undefined) {
      updateData.parentTaskId = data.dto.parentTaskId;
    }

    if (data.dto.storyPoints !== undefined) {
      updateData.storyPoints = data.dto.storyPoints;
    }

    if (data.dto.estimatedHours !== undefined) {
      updateData.estimatedHours = data.dto.estimatedHours;
    }

    if (data.dto.dueDate !== undefined) {
      updateData.dueDate = data.dto.dueDate ? new Date(data.dto.dueDate) : null;
    }

    if (data.dto.displayOrder !== undefined) {
      updateData.displayOrder = data.dto.displayOrder;
    }

    if (data.dto.isFavorite !== undefined) {
      updateData.isFavorite = data.dto.isFavorite;
    }

    if (data.dto.archived !== undefined) {
      updateData.archived = data.dto.archived;
    }

    if (data.dto.milestoneId !== undefined) {
      updateData.milestoneId = data.dto.milestoneId;
    }

    if (data.dto.progressPercent !== undefined) {
      updateData.progressPercent = data.dto.progressPercent;
    }

    return this.prismaService.$transaction(async (tx) => {
      if (
        data.dto.deletedAttachments !== undefined &&
        data.dto.deletedAttachments.length > 0
      ) {
        await tx.taskAttachment.deleteMany({
          where: {
            taskId: data.taskId,
            file: { in: data.dto.deletedAttachments },
          },
        });
      }

      if (data.dto.attachments !== undefined && data.dto.attachments.length > 0) {
        await tx.taskAttachment.createMany({
          data: data.dto.attachments.map((a) => ({
            taskId: data.taskId,
            file: a.file,
          })),
          skipDuplicates: true,
        });
      }

      return tx.task.update({
        where: { id: data.taskId },
        data: updateData,
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
    });
  }

  updateTaskStatus(data: {
    taskId: string;
    status: string;
    displayOrder?: number;
  }) {
    const updateData: Prisma.TaskUncheckedUpdateInput = {
      status: data.status,
    };

    if (data.status === 'DONE') {
      updateData.completedAt = new Date();
    }

    if (data.displayOrder !== undefined) {
      updateData.displayOrder = data.displayOrder;
    }

    return this.prismaService.task.update({
      where: { id: data.taskId },
      data: updateData,
      select: {
        id: true,
        status: true,
        displayOrder: true,
        completedAt: true,
        updatedAt: true,
      },
    });
  }

  addDependency(data: {
    taskId: string;
    blockingTaskId: string;
    dependencyType?: string;
  }) {
    return this.prismaService.taskDependency.create({
      data: {
        blockingTaskId: data.blockingTaskId,
        blockedTaskId: data.taskId,
        dependencyType: data.dependencyType ?? 'blocks',
      },
      select: {
        id: true,
        blockingTaskId: true,
        blockedTaskId: true,
        dependencyType: true,
        createdAt: true,
      },
    });
  }

  removeDependency(data: { dependencyId: string }) {
    return this.prismaService.taskDependency.delete({
      where: { id: data.dependencyId },
    });
  }

  async reorderBacklog(data: {
    tasks: { taskId: string; displayOrder: number }[];
  }) {
    return this.prismaService.$transaction(
      data.tasks.map((task) =>
        this.prismaService.task.update({
          where: { id: task.taskId },
          data: { displayOrder: task.displayOrder },
          select: {
            id: true,
            displayOrder: true,
          },
        }),
      ),
    );
  }

  moveToSprint(data: { taskId: string; sprintId: string }) {
    return this.prismaService.task.update({
      where: { id: data.taskId },
      data: {
        sprintId: data.sprintId,
        status: 'TODO',
      },
      select: {
        id: true,
        key: true,
        title: true,
        sprintId: true,
        status: true,
        displayOrder: true,
        updatedAt: true,
      },
    });
  }

  updateComment(data: { commentId: string; content: string }) {
    return this.prismaService.taskComment.update({
      where: { id: data.commentId },
      data: { content: data.content },
      select: {
        id: true,
        taskId: true,
        authorId: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  updateTimeEntry(data: {
    timeEntryId: string;
    hours?: number;
    description?: string;
  }) {
    const updateData: Prisma.TaskTimeEntryUpdateInput = {};
    if (data.hours !== undefined) updateData.hours = data.hours;
    if (data.description !== undefined)
      updateData.description = data.description;

    return this.prismaService.taskTimeEntry.update({
      where: { id: data.timeEntryId },
      data: updateData,
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

  async recalculateActualHours(data: { taskId: string }) {
    const result = await this.prismaService.taskTimeEntry.aggregate({
      where: { taskId: data.taskId },
      _sum: { hours: true },
    });
    const totalHours = result._sum.hours ?? 0;

    return this.prismaService.task.update({
      where: { id: data.taskId },
      data: { actualHours: totalHours },
      select: { id: true, actualHours: true },
    });
  }

  async toggleCommentLike(data: { commentId: string; userId: string }) {
    const existingLike = await this.prismaService.taskCommentLike.findUnique({
      where: {
        commentId_userId: {
          commentId: data.commentId,
          userId: data.userId,
        },
      },
    });

    if (existingLike) {
      await this.prismaService.taskCommentLike.delete({
        where: { id: existingLike.id },
      });
      return { liked: false };
    }

    await this.prismaService.taskCommentLike.create({
      data: { commentId: data.commentId, userId: data.userId },
    });
    return { liked: true };
  }
}
