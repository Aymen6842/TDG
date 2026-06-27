import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { UpdateSprintDto } from '../dto/request/update/update-sprint.dto';
import { Language } from '@prisma/client';

@Injectable()
export class UpdateSprintRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  updateSprint(data: { id: string; dto: UpdateSprintDto }) {
    const sprintData: Record<string, unknown> = {};

    if (data.dto.status !== undefined) sprintData.status = data.dto.status;
    if (data.dto.startDate !== undefined)
      sprintData.startDate = data.dto.startDate;
    if (data.dto.endDate !== undefined) sprintData.endDate = data.dto.endDate;
    if (data.dto.estimatedStartDate !== undefined)
      sprintData.estimatedStartDate = data.dto.estimatedStartDate;
    if (data.dto.estimatedEndDate !== undefined)
      sprintData.estimatedEndDate = data.dto.estimatedEndDate;
    if (data.dto.capacity !== undefined)
      sprintData.capacity = data.dto.capacity;

    return this.prismaService.sprint.update({
      where: { id: data.id },
      data: sprintData,
      select: {
        id: true,
        projectId: true,
        createdById: true,
        startDate: true,
        endDate: true,
        estimatedStartDate: true,
        estimatedEndDate: true,
        status: true,
        capacity: true,
        createdAt: true,
        updatedAt: true,
        contents: {
          select: {
            id: true,
            name: true,
            unaccentedName: true,
            description: true,
            details: true,
          },
        },
        attachments: {
          select: {
            id: true,
            attachment: true,
          },
        },
      },
    });
  }

  updateContent(data: {
    sprintId: string;
    content: Array<{
      name: string;
      unaccentedName: string;
      description?: string;
      details?: string;
      language: Language;
    }>;
  }): Promise<void> {
    return this.prismaService.sprintContent
      .deleteMany({
        where: { sprintId: data.sprintId },
      })
      .then(() => {
        if (data.content.length === 0) {
          return;
        }

        return this.prismaService.sprintContent.createMany({
          data: data.content.map((c) => ({
            sprintId: data.sprintId,
            name: c.name,
            unaccentedName: c.unaccentedName,
            description: c.description ?? null,
            details: c.details ?? null,
            language: c.language,
          })),
        });
      })
      .then(() => undefined);
  }

  updateAttachments(data: {
    sprintId: string;
    attachments: Array<{ file: string }>;
  }): Promise<void> {
    return this.prismaService.sprintAttachment
      .deleteMany({
        where: { sprintId: data.sprintId },
      })
      .then(() => {
        if (data.attachments.length === 0) {
          return;
        }

        return this.prismaService.sprintAttachment.createMany({
          data: data.attachments.map((a) => ({
            sprintId: data.sprintId,
            attachment: a.file,
          })),
        });
      })
      .then(() => undefined);
  }
}
