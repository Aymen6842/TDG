import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

@Injectable()
export class DeleteTaskRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  deleteTask(data: { taskId: string; projectId: string }) {
    return this.prismaService.task.delete({
      where: { id: data.taskId, projectId: data.projectId },
    });
  }

  deleteComment(data: { commentId: string }) {
    return this.prismaService.taskComment.delete({
      where: { id: data.commentId },
    });
  }

  deleteTimeEntry(data: { timeEntryId: string }) {
    return this.prismaService.taskTimeEntry.delete({
      where: { id: data.timeEntryId },
    });
  }
}
