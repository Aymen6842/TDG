import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { UpdateEpicDto } from '../dto/request/update/update-epic.dto';

@Injectable()
export class UpdateEpicRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  private toDate(value?: string | null): Date | null {
    return value ? new Date(value) : null;
  }

  /**
   * Update an existing epic
   */
  updateEpic(data: { epicId: string; projectId: string; dto: UpdateEpicDto }) {
    return this.prismaService.epic.update({
      where: {
        id: data.epicId,
        projectId: data.projectId,
      },
      data: {
        ...(data.dto.name !== undefined &&
          data.dto.name !== null && { name: data.dto.name }),
        ...(data.dto.description !== undefined && {
          description: data.dto.description ?? null,
        }),
        ...(data.dto.color !== undefined && {
          color: data.dto.color ?? null,
        }),
        ...(data.dto.startDate !== undefined && {
          startDate: this.toDate(data.dto.startDate),
        }),
        ...(data.dto.endDate !== undefined && {
          endDate: this.toDate(data.dto.endDate),
        }),
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
