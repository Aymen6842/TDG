import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { CreateEpicDto } from '../dto/request/post/create-epic.dto';

@Injectable()
export class CreateEpicRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  private toDate(value?: string | null): Date | null {
    return value ? new Date(value) : null;
  }

  /**
   * Create a new epic
   */
  createEpic(data: { projectId: string; dto: CreateEpicDto }) {
    return this.prismaService.epic.create({
      data: {
        projectId: data.projectId,
        name: data.dto.name,
        description: data.dto.description ?? null,
        color: data.dto.color ?? null,
        startDate: this.toDate(data.dto.startDate),
        endDate: this.toDate(data.dto.endDate),
      },
      select: {
        id: true,
        projectId: true,
        name: true,
        description: true,
        color: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
