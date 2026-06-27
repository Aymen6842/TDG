import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { CreateProjectDto } from '../dto/request/post/create-project.dto';
import { ProjectWithRelations } from './fetch-project.repository';
import { Language } from '@prisma/client';

@Injectable()
export class CreateProjectRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  createProject(
    data: CreateProjectDto & {
      language?: Language;
    },
  ): Promise<ProjectWithRelations> {
    const language = data.language ?? Language.English;
    const estimatedStartDate = data.estimatedStartDate ?? data.startDate;
    const estimatedEndDate = data.estimatedEndDate ?? data.endDate;
    const members = data.members ?? [];
    const createMembers = members
      .filter((member): member is { userId: string; isManager?: boolean } => {
        return typeof member.userId === 'string' && member.userId.length > 0;
      })
      .map((member) => ({
        userId: member.userId,
        isManager: member.isManager,
      }));

    return this.prismaService.project.create({
      data: {
        businessUnit: data.businessUnit,
        projectType: data.projectType ?? 'AGILE',
        status: data.status ?? 'Pending',
        paid: data.paid ?? false,
        startDate: data.startDate,
        endDate: data.endDate,
        estimatedStartDate,
        estimatedEndDate,
        displayOrder: data.displayOrder ?? 1000,
        createdById: data.createdById,
        members: {
          create: createMembers,
        },
        contents: {
          create: data.contents.map((content) => ({
            name: content.name,
            unaccentedName: content.unaccentedName,
            description: content.description,
            details: content.details,
            language: content.language ?? language,
          })),
        },
      },
      select: {
        id: true,
        businessUnit: true,
        status: true,
        paid: true,
        projectType: true,
        kanbanSettings: true,
        startDate: true,
        endDate: true,
        estimatedStartDate: true,
        estimatedEndDate: true,
        displayOrder: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        members: {
          select: {
            id: true,
            userId: true,
            isManager: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
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
      },
    });
  }

  addMember(data: { projectId: string; userId: string; isManager: boolean }) {
    return this.prismaService.projectMember.create({
      data: {
        projectId: data.projectId,
        userId: data.userId,
        isManager: data.isManager,
      },
      select: {
        id: true,
        userId: true,
        projectId: true,
        isManager: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });
  }
}
