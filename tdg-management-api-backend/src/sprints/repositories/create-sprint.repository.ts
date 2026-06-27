import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { CreateSprintDto } from '../dto/request/post/create-sprint.dto';
import { Language, SprintStatus } from '@prisma/client';

@Injectable()
export class CreateSprintRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  createSprint(data: {
    startDate: CreateSprintDto['startDate'];
    endDate: CreateSprintDto['endDate'];
    estimatedStartDate: CreateSprintDto['estimatedStartDate'];
    estimatedEndDate: CreateSprintDto['estimatedEndDate'];
    content: CreateSprintDto['content'];
    attachments?: CreateSprintDto['attachments'];
    capacity?: CreateSprintDto['capacity'];
    projectId: string;
    createdById: string;
    language?: Language;
  }) {
    const language = data.language ?? Language.English;

    return this.prismaService.sprint.create({
      data: {
        projectId: data.projectId,
        createdById: data.createdById,
        startDate: data.startDate,
        endDate: data.endDate,
        estimatedStartDate: data.estimatedStartDate,
        estimatedEndDate: data.estimatedEndDate,
        status: SprintStatus.Pending,
        ...(data.capacity !== undefined && data.capacity !== null
          ? { capacity: data.capacity }
          : {}),
        contents: {
          create: data.content.map((c) => ({
            name: c.name,
            unaccentedName: c.unaccentedName,
            description: c.description ?? null,
            details: c.details ?? null,
            language: c.language ?? language,
          })),
        },
        ...(data.attachments && data.attachments.length > 0
          ? {
              attachments: {
                create: data.attachments.map((a) => ({
                  attachment: a.file,
                })),
              },
            }
          : {}),
      },
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
          where: language ? { language } : undefined,
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
            createdAt: true,
          },
        },
      },
    });
  }
}
