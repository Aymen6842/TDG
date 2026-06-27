import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { CreateMilestoneDto } from '../dto/request/post/create-milestone.dto';

@Injectable()
export class CreateMilestoneRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  private toDate(value?: string | null): Date | null {
    return value ? new Date(value) : null;
  }

  /**
   * Create a new milestone
   */
  createMilestone(data: { projectId: string; dto: CreateMilestoneDto }) {
    return this.prismaService.milestone.create({
      data: {
        projectId: data.projectId,
        name: data.dto.name,
        description: data.dto.description ?? null,
        dueDate: this.toDate(data.dto.dueDate),
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
