import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { UpdateProjectDto } from '../dto/request/update/update-project.dto';
import { Prisma, BusinessUnit } from '@prisma/client';
import { ProjectWithRelations } from './fetch-project.repository';

@Injectable()
export class UpdateProjectRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  updateProjectWithPermission({
    data,
    projectData,
  }: {
    data: {
      projectId: string;
      userId: string | null;
      businessUnit: BusinessUnit | null;
    };
    projectData: UpdateProjectDto;
  }): Promise<ProjectWithRelations> {
    const updateData: Prisma.ProjectUpdateInput = {};

    if (projectData.paid !== undefined) {
      updateData.paid = projectData.paid;
    }

    if (projectData.status) {
      updateData.status = projectData.status;
    }

    if (projectData.startDate) {
      updateData.startDate = projectData.startDate;
    }

    if (projectData.endDate) {
      updateData.endDate = projectData.endDate;
    }

    if (projectData.estimatedStartDate) {
      updateData.estimatedStartDate = projectData.estimatedStartDate;
    }

    if (projectData.estimatedEndDate) {
      updateData.estimatedEndDate = projectData.estimatedEndDate;
    }

    if (projectData.displayOrder !== undefined) {
      updateData.displayOrder = projectData.displayOrder;
    }

    if (projectData.kanbanSettings !== undefined) {
      updateData.kanbanSettings = projectData.kanbanSettings ?? Prisma.JsonNull;
    }

    const where: Prisma.ProjectWhereInput = {
      id: data.projectId,
    };

    if (data.userId) {
      where.members = {
        some: {
          userId: data.userId,
          isManager: true,
        },
      };
    }

    if (data.businessUnit) {
      where.businessUnit = data.businessUnit;
    }

    return this.prismaService.$transaction(async (tx) => {
      const existingProject = await tx.project.findFirstOrThrow({
        where,
        select: { id: true },
      });

      if (Object.keys(updateData).length > 0) {
        await tx.project.update({
          where: { id: existingProject.id },
          data: updateData,
        });
      }

      if (projectData.members && projectData.members.length > 0) {
        await tx.projectMember.deleteMany({
          where: { projectId: existingProject.id },
        });

        if (projectData.members.some((member) => !!member.userId)) {
          await tx.projectMember.createMany({
            data: projectData.members
              .filter((member) => !!member.userId)
              .map((member) => ({
                projectId: existingProject.id,
                userId: member.userId as string,
                isManager: member.isManager ?? false,
              })),
          });
        }
      }

      if (projectData.contents && projectData.contents.length > 0) {
        await tx.projectContent.deleteMany({
          where: { projectId: existingProject.id },
        });

        if (projectData.contents.some((content) => !!content.name)) {
          await Promise.all(
            projectData.contents
              .filter((content) => !!content.name)
              .map((content) =>
                tx.projectContent.create({
                  data: {
                    projectId: existingProject.id,
                    name: content.name as string,
                    unaccentedName: content.unaccentedName ?? '',
                    description: content.description ?? null,
                    details: content.details ?? null,
                    language: content.language ?? 'English',
                  },
                }),
              ),
          );
        }
      }

      return tx.project.findUniqueOrThrow({
        where: { id: existingProject.id },
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
    });
  }

  findProjectById(data: { projectId: string }) {
    return this.prismaService.project.findUnique({
      where: { id: data.projectId },
      select: {
        id: true,
        isArchived: true,
        archivedAt: true,
        kanbanSettings: true,
        projectType: true,
      },
    });
  }

  updateKanbanSettings(data: {
    projectId: string;
    settings: Record<string, number> | null;
  }) {
    return this.prismaService.project.update({
      where: { id: data.projectId },
      data: { kanbanSettings: data.settings ?? Prisma.JsonNull },
      // Prisma.JsonNull explicitly sets the JSON column to SQL NULL
      select: {
        id: true,
        kanbanSettings: true,
        projectType: true,
      },
    });
  }

  archiveProject(data: { projectId: string }) {
    return this.prismaService.project.update({
      where: { id: data.projectId },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });
  }

  restoreProject(data: { projectId: string }) {
    return this.prismaService.project.update({
      where: { id: data.projectId },
      data: {
        isArchived: false,
        archivedAt: null,
      },
    });
  }

  async updateMember(data: {
    memberId: string;
    projectId: string;
    isManager: boolean;
  }) {
    const member = await this.prismaService.projectMember.findFirstOrThrow({
      where: { id: data.memberId, projectId: data.projectId },
      select: { id: true },
    });

    return this.prismaService.projectMember.update({
      where: { id: member.id },
      data: { isManager: data.isManager },
      select: {
        id: true,
        userId: true,
        isManager: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });
  }
}
