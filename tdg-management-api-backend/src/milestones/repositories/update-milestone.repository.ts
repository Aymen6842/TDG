import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { UpdateMilestoneDto } from '../dto/request/update/update-milestone.dto';

@Injectable()
export class UpdateMilestoneRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  private toDate(value?: string | null): Date | null {
    return value ? new Date(value) : null;
  }

  /**
   * Update an existing milestone
   */
  updateMilestone(data: {
    milestoneId: string;
    projectId: string;
    dto: UpdateMilestoneDto;
  }) {
    return this.prismaService.milestone.update({
      where: {
        id: data.milestoneId,
        projectId: data.projectId,
      },
      data: {
        ...(data.dto.name !== undefined &&
          data.dto.name !== null && { name: data.dto.name }),
        ...(data.dto.description !== undefined && {
          description: data.dto.description ?? null,
        }),
        ...(data.dto.dueDate !== undefined && {
          dueDate: this.toDate(data.dto.dueDate),
        }),
      },
      select: {
        id: true,
        projectId: true,
        name: true,
        description: true,
        dueDate: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  completeMilestone(data: { milestoneId: string; projectId: string }) {
    return this.prismaService.milestone.update({
      where: {
        id: data.milestoneId,
        projectId: data.projectId,
      },
      data: {
        completedAt: new Date(),
      },
      select: {
        id: true,
        projectId: true,
        name: true,
        description: true,
        dueDate: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
