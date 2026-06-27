import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

@Injectable()
export class DeleteMilestoneRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  countLinkedTasks(data: {
    milestoneId: string;
    projectId: string;
  }): Promise<number> {
    return this.prismaService.task.count({
      where: {
        milestoneId: data.milestoneId,
        projectId: data.projectId,
      },
    });
  }

  /**
   * Delete a milestone
   */
  deleteMilestone(data: {
    milestoneId: string;
    projectId: string;
  }): Promise<void> {
    return this.prismaService.milestone
      .delete({
        where: {
          id: data.milestoneId,
          projectId: data.projectId,
        },
      })
      .then(() => undefined);
  }
}
