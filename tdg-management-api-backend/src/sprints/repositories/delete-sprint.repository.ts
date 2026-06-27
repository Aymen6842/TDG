import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

@Injectable()
export class DeleteSprintRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  deleteSprint(data: { sprintId: string; projectId: string }): Promise<void> {
    return this.prismaService.sprint
      .delete({
        where: { id: data.sprintId, projectId: data.projectId },
      })
      .then(() => undefined);
  }

  hasTasks(data: { sprintId: string }): Promise<boolean> {
    return this.prismaService.task
      .count({
        where: {
          sprintId: data.sprintId,
        },
      })
      .then((count) => count > 0);
  }
}
